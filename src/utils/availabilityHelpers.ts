/**
 * Product Availability Helpers
 * Handles display logic for "متوفر" vs "متوفر طلبية X ساعة"
 */

import { Product } from '../types/product';

export type AvailabilityStatus = {
    type: 'IN_STOCK' | 'ORDER' | 'OUT_OF_STOCK';
    label: string;
    labelAr: string;
    color: string;
    bgColor: string;
    deliveryHours?: number;
};

/**
 * Get availability status display info for a product
 */
export function getProductAvailability(product: Product): AvailabilityStatus {
    // Check if out of stock
    const totalQty = product.qtyTotal || product.stock || 0;
    if (totalQty <= 0 && product.availabilityType !== 'ORDER') {
        return {
            type: 'OUT_OF_STOCK',
            label: 'Out of Stock',
            labelAr: 'غير متوفر',
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        };
    }

    // Check if order product (طلبية)
    if (product.availabilityType === 'ORDER' || product.storageSection === 'ORDER_PRODUCTS') {
        const hours = product.deliveryHours || product.uploadBatchDeliveryHours || 24;
        return {
            type: 'ORDER',
            label: `Available on Order (${hours}h)`,
            labelAr: `متوفر طلبية ${hours} ساعة`,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
            deliveryHours: hours,
        };
    }

    // Default: in stock
    return {
        type: 'IN_STOCK',
        label: 'In Stock',
        labelAr: 'متوفر',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    };
}

/**
 * Format delivery hours for display
 */
export function formatDeliveryTime(hours: number): string {
    if (hours < 24) {
        return `${hours} ساعة`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
        return days === 1 ? 'يوم واحد' : `${days} أيام`;
    }
    return `${days} أيام و ${remainingHours} ساعة`;
}

/**
 * Get storage section display info
 */
export function getStorageSectionLabel(section?: string): { label: string; icon: string } {
    switch (section) {
        case 'SINICAR_WAREHOUSE':
            return { label: 'مستودع صيني كار', icon: '🏭' };
        case 'ORDER_PRODUCTS':
            return { label: 'منتجات طلبية', icon: '📦' };
        case 'SUPPLIER':
            return { label: 'مورد مسجل', icon: '🚚' };
        default:
            return { label: 'غير محدد', icon: '📋' };
    }
}

/**
 * Create availability badge component props
 */
export function getAvailabilityBadgeProps(product: Product): {
    text: string;
    className: string;
    icon: string;
} {
    const status = getProductAvailability(product);

    switch (status.type) {
        case 'IN_STOCK':
            return {
                text: status.labelAr,
                className: 'bg-green-100 text-green-700 border-green-200',
                icon: '✅',
            };
        case 'ORDER':
            return {
                text: status.labelAr,
                className: 'bg-amber-100 text-amber-700 border-amber-200',
                icon: '📦',
            };
        case 'OUT_OF_STOCK':
            return {
                text: status.labelAr,
                className: 'bg-red-100 text-red-700 border-red-200',
                icon: '❌',
            };
    }
}
