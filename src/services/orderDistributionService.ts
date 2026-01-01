/**
 * Order Distribution Service
 * Handles splitting customer orders to multiple suppliers
 * Separates LOCAL and INTERNATIONAL supplier comparisons
 */

import {
    SupplierPurchaseOrder,
    SupplierPurchaseOrderItem,
    PurchaseOrderType,
    SupplierType,
    SupplierPOStatus,
    Product
} from '../types';

// Extended Product type with optional supplier fields
type ExtendedProduct = Product & {
    supplierId?: string;
    supplierName?: string;
    qualityCode?: string;
    source?: string;
};

interface OrderDistributionItem {
    partNumber: string;
    quantity: number;
    qualityCode?: string;
}

interface OrderDistributionRequest {
    customerOrderId: string;
    customerOrderNumber: string;
    orderType: PurchaseOrderType;  // LOCAL or INTERNATIONAL - determines which suppliers to compare
    items: OrderDistributionItem[];
}

interface OrderDistributionResult {
    purchaseOrders: SupplierPurchaseOrder[];
    sinicarItems: OrderDistributionItem[];  // Items from Sini Car's own stock
    unavailableItems: OrderDistributionItem[];  // Items not found
    summary: {
        totalRequested: number;
        assignedToSuppliers: number;
        assignedToSinicar: number;
        unavailable: number;
        suppliersInvolved: number;
    };
}

interface SupplierProductMatch {
    supplierId: string;
    supplierName: string;
    supplierType: SupplierType;
    productId: string;
    partNumber: string;
    productName: string;
    qualityCode?: string;
    price: number;  // Wholesale price
    stock: number;
    priority: number;  // Lower is better
}

/**
 * Distributes a customer order to appropriate suppliers
 * 
 * Rules:
 * 1. LOCAL orders only compare LOCAL suppliers
 * 2. INTERNATIONAL orders only compare INTERNATIONAL suppliers
 * 3. One order can be split to multiple suppliers
 * 4. Each supplier gets a separate PurchaseOrder
 * 5. Sini Car's own stock is checked first (optional)
 */
export function distributeOrderToSuppliers(
    request: OrderDistributionRequest,
    allProducts: ExtendedProduct[],
    supplierPriorities: Map<string, number>
): OrderDistributionResult {
    const purchaseOrders: SupplierPurchaseOrder[] = [];
    const sinicarItems: OrderDistributionItem[] = [];
    const unavailableItems: OrderDistributionItem[] = [];

    // Group items by supplier
    const supplierItemsMap = new Map<string, {
        supplierId: string;
        supplierName: string;
        supplierType: SupplierType;
        items: SupplierPurchaseOrderItem[];
    }>();

    // Process each requested item
    for (const requestItem of request.items) {
        // Find all products matching this part number
        const matches: SupplierProductMatch[] = findProductMatches(
            requestItem.partNumber,
            allProducts,
            request.orderType,
            supplierPriorities
        );

        if (matches.length === 0) {
            unavailableItems.push(requestItem);
            continue;
        }

        // Sort by priority (lower is better)
        matches.sort((a, b) => a.priority - b.priority);

        // Check Sini Car stock first
        const sinicarMatch = matches.find(m => m.supplierType === 'SINICAR');
        if (sinicarMatch && sinicarMatch.stock >= requestItem.quantity) {
            sinicarItems.push(requestItem);
            continue;
        }

        // Find best supplier with enough stock
        let assigned = false;
        for (const match of matches) {
            if (match.supplierType === 'SINICAR') continue; // Already checked

            if (match.stock >= requestItem.quantity) {
                // Add to supplier's items
                addItemToSupplier(supplierItemsMap, match, requestItem);
                assigned = true;
                break;
            }
        }

        if (!assigned) {
            // No supplier has enough stock, use first available
            const firstMatch = matches.find(m => m.supplierType !== 'SINICAR');
            if (firstMatch) {
                addItemToSupplier(supplierItemsMap, firstMatch, requestItem);
            } else {
                unavailableItems.push(requestItem);
            }
        }
    }

    // Convert supplier items to PurchaseOrders
    const totalSplits = supplierItemsMap.size;
    let splitIndex = 0;

    for (const [supplierId, supplierData] of supplierItemsMap) {
        splitIndex++;

        const po: SupplierPurchaseOrder = {
            id: `po-${Date.now()}-${splitIndex}`,
            orderNumber: `PO-${new Date().getFullYear()}-${String(splitIndex).padStart(3, '0')}`,
            supplierId: supplierData.supplierId,
            supplierName: supplierData.supplierName,
            supplierType: supplierData.supplierType,
            orderType: request.orderType,
            customerOrderId: request.customerOrderId,
            customerOrderNumber: request.customerOrderNumber,
            splitIndex,
            totalSplits,
            items: supplierData.items,
            status: 'NEW' as SupplierPOStatus,
            createdAt: new Date().toISOString(),
            totalItems: supplierData.items.length,
            totalQuantity: supplierData.items.reduce((sum, i) => sum + i.quantityRequested, 0),
            totalAmount: supplierData.items.reduce((sum, i) => sum + i.totalPrice, 0),
        };

        purchaseOrders.push(po);
    }

    // Calculate summary
    const summary = {
        totalRequested: request.items.length,
        assignedToSuppliers: purchaseOrders.reduce((sum, po) => sum + po.totalItems, 0),
        assignedToSinicar: sinicarItems.length,
        unavailable: unavailableItems.length,
        suppliersInvolved: purchaseOrders.length,
    };

    return {
        purchaseOrders,
        sinicarItems,
        unavailableItems,
        summary,
    };
}

function findProductMatches(
    partNumber: string,
    products: ExtendedProduct[],
    orderType: PurchaseOrderType,
    priorityMap: Map<string, number>
): SupplierProductMatch[] {
    const matches: SupplierProductMatch[] = [];

    for (const product of products) {
        if (product.partNumber.toLowerCase() !== partNumber.toLowerCase()) continue;

        // Determine supplier type from product source
        const supplierType = getSupplierType(product);

        // Filter by order type
        if (orderType === 'LOCAL' && supplierType === 'INTERNATIONAL') continue;
        if (orderType === 'INTERNATIONAL' && supplierType === 'LOCAL') continue;

        matches.push({
            supplierId: product.supplierId || 'sinicar',
            supplierName: product.supplierName || 'صيني كار',
            supplierType,
            productId: product.id,
            partNumber: product.partNumber,
            productName: product.name,
            qualityCode: product.qualityCode,
            price: product.priceWholesale || product.price || 0,
            stock: product.stock || 0,
            priority: priorityMap.get(product.supplierId || 'sinicar') || 999,
        });
    }

    return matches;
}

function getSupplierType(product: ExtendedProduct): SupplierType {
    // Check if product is from Sini Car's own stock
    if (!product.supplierId || product.supplierId === 'sinicar') {
        return 'SINICAR';
    }

    // Check product source field if available
    if (product.source === 'INTERNATIONAL_SUPPLIER') {
        return 'INTERNATIONAL';
    }

    return 'LOCAL';
}

function addItemToSupplier(
    map: Map<string, { supplierId: string; supplierName: string; supplierType: SupplierType; items: SupplierPurchaseOrderItem[] }>,
    match: SupplierProductMatch,
    requestItem: OrderDistributionItem
): void {
    if (!map.has(match.supplierId)) {
        map.set(match.supplierId, {
            supplierId: match.supplierId,
            supplierName: match.supplierName,
            supplierType: match.supplierType,
            items: [],
        });
    }

    const supplierData = map.get(match.supplierId)!;

    supplierData.items.push({
        id: `item-${Date.now()}-${supplierData.items.length}`,
        partNumber: requestItem.partNumber,
        productName: match.productName,
        qualityCode: requestItem.qualityCode || match.qualityCode,
        quantityRequested: requestItem.quantity,
        supplierPrice: match.price,
        totalPrice: match.price * requestItem.quantity,
        isAvailable: true,
    });
}

/**
 * Get distribution preview without creating actual orders
 * Useful for showing user how order will be split
 */
export function previewOrderDistribution(
    request: OrderDistributionRequest,
    allProducts: ExtendedProduct[],
    supplierPriorities: Map<string, number>
): {
    distribution: Array<{
        supplierName: string;
        supplierType: SupplierType;
        itemCount: number;
        items: string[];  // Part numbers
        estimatedTotal: number;
    }>;
    sinicarItemCount: number;
    unavailableItemCount: number;
} {
    const result = distributeOrderToSuppliers(request, allProducts, supplierPriorities);

    return {
        distribution: result.purchaseOrders.map(po => ({
            supplierName: po.supplierName,
            supplierType: po.supplierType,
            itemCount: po.totalItems,
            items: po.items.map(i => i.partNumber),
            estimatedTotal: po.totalAmount,
        })),
        sinicarItemCount: result.sinicarItems.length,
        unavailableItemCount: result.unavailableItems.length,
    };
}
