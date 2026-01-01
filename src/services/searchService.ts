import { Product, SearchResult, SearchResultType, MissingAvailabilityStatus, SearchSourceType, User } from '../types';
import { normalizePartNumberRaw, extractNumericCore } from '../utils/partNumberUtils';
import { Api } from './api';

export interface SearchContext {
  customerId: string | null;
  customerName?: string;
  carInfo?: string;
  branchId?: string;
}

export interface PartSearchResult extends SearchResult {
  message: string;
  showPrice: boolean;
}

export function normalizePartNumber(raw: string): string | null {
  if (!raw) return null;
  
  const trimmed = raw.trim();
  if (!trimmed) return null;
  
  const normalized = normalizePartNumberRaw(trimmed);
  
  if (normalized.length < 2) return null;
  
  return normalized;
}

export function validatePartNumberInput(input: string): { isValid: boolean; normalized: string | null; error?: string } {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, normalized: null, error: 'الرجاء إدخال رقم القطعة بشكل صحيح.' };
  }
  
  const normalized = normalizePartNumber(trimmed);
  
  if (!normalized) {
    return { isValid: false, normalized: null, error: 'الرجاء إدخال رقم القطعة بشكل صحيح.' };
  }
  
  return { isValid: true, normalized };
}

export async function searchPartInCatalog(partNumber: string, applyVisibilityFilter: boolean = true): Promise<SearchResult> {
  const normalized = normalizePartNumber(partNumber);
  if (!normalized) {
    return { type: 'NOT_FOUND', normalizedQuery: partNumber };
  }
  
  const numericCore = extractNumericCore(normalized);
  
  const products = await Api.searchProducts('');
  const stockThreshold = Api.getStockThreshold();
  const minVisibleQty = Api.getMinVisibleQty();
  
  let bestMatch: Product | null = null;
  let bestScore = 0;
  
  for (const product of products) {
    const qty = product.qtyTotal ?? product.stock ?? 0;
    
    if (applyVisibilityFilter && qty < minVisibleQty) {
      continue;
    }
    
    const pNormalized = product.normalizedPart || normalizePartNumberRaw(product.partNumber);
    const pNumeric = product.numericPartCore || extractNumericCore(product.partNumber);
    
    let score = 0;
    
    if (pNormalized === normalized) {
      score = 100;
    } else if (pNumeric === numericCore && numericCore.length > 3) {
      score = 80;
    } else if (pNormalized.includes(normalized) || normalized.includes(pNormalized)) {
      score = 50;
    } else if (pNumeric.includes(numericCore) || numericCore.includes(pNumeric)) {
      if (numericCore.length > 4) score = 40;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = product;
    }
    
    if (score === 100) break;
  }
  
  if (!bestMatch || bestScore < 50) {
    return { type: 'NOT_FOUND', normalizedQuery: normalized };
  }
  
  const qty = bestMatch.qtyTotal ?? bestMatch.stock ?? 0;
  
  if (qty <= stockThreshold) {
    return { type: 'FOUND_OUT_OF_STOCK', product: bestMatch, normalizedQuery: normalized };
  }
  
  return { type: 'FOUND_AVAILABLE', product: bestMatch, normalizedQuery: normalized };
}

export function filterProductsForCustomer(products: Product[]): Product[] {
  const minVisibleQty = Api.getMinVisibleQty();
  return products.filter(product => {
    const qty = product.qtyTotal ?? product.stock ?? 0;
    return qty >= minVisibleQty;
  });
}

export async function handlePartSearch(
  partNumberInput: string, 
  context: SearchContext,
  searchSource: SearchSourceType = 'heroSearch'
): Promise<PartSearchResult> {
  const validation = validatePartNumberInput(partNumberInput);
  
  if (!validation.isValid) {
    return {
      type: 'NOT_FOUND',
      message: validation.error || 'الرجاء إدخال رقم القطعة بشكل صحيح.',
      showPrice: false
    };
  }
  
  const result = await searchPartInCatalog(partNumberInput);
  
  switch (result.type) {
    case 'NOT_FOUND':
      await handleNotFoundCase(result.normalizedQuery || partNumberInput, context, searchSource);
      return {
        type: 'NOT_FOUND',
        normalizedQuery: result.normalizedQuery,
        message: 'القطعة غير متوفرة حاليًا.',
        showPrice: false
      };
      
    case 'FOUND_OUT_OF_STOCK':
      await handleOutOfStockCase(result.product!, context, searchSource, result.normalizedQuery);
      return {
        type: 'FOUND_OUT_OF_STOCK',
        product: result.product,
        normalizedQuery: result.normalizedQuery,
        message: 'الكمية نفذت حاليًا من هذه القطعة.',
        showPrice: false
      };
      
    case 'FOUND_AVAILABLE':
      return {
        type: 'FOUND_AVAILABLE',
        product: result.product,
        normalizedQuery: result.normalizedQuery,
        message: '',
        showPrice: true
      };
      
    default:
      return {
        type: 'NOT_FOUND',
        message: 'حدث خطأ غير متوقع، الرجاء المحاولة مرة أخرى.',
        showPrice: false
      };
  }
}

async function handleNotFoundCase(
  partNumber: string, 
  context: SearchContext, 
  searchSource: SearchSourceType
): Promise<void> {
  try {
    await Api.logMissingPartFromSearch({
      partNumber,
      normalizedPartNumber: normalizePartNumber(partNumber) || partNumber,
      customerId: context.customerId,
      customerName: context.customerName,
      carInfo: context.carInfo,
      branchId: context.branchId,
      availabilityStatus: 'not_found',
      searchSource
    });
  } catch (error) {
    console.error('Error logging missing part (not_found):', error);
  }
}

async function handleOutOfStockCase(
  product: Product, 
  context: SearchContext, 
  searchSource: SearchSourceType,
  normalizedQuery?: string
): Promise<void> {
  try {
    await Api.logMissingPartFromSearch({
      partNumber: product.partNumber,
      normalizedPartNumber: normalizedQuery || normalizePartNumberRaw(product.partNumber),
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      customerId: context.customerId,
      customerName: context.customerName,
      carInfo: context.carInfo,
      branchId: context.branchId,
      availabilityStatus: 'out_of_stock',
      searchSource
    });
  } catch (error) {
    console.error('Error logging missing part (out_of_stock):', error);
  }
}

export function createSearchContext(user: User | null): SearchContext {
  return {
    customerId: user?.id || null,
    customerName: user?.name,
    branchId: user?.branchId
  };
}

export function getSearchResultMessages(result: PartSearchResult): {
  customerMessage: string;
  showProduct: boolean;
  showPrice: boolean;
} {
  switch (result.type) {
    case 'NOT_FOUND':
      return {
        customerMessage: result.message,
        showProduct: false,
        showPrice: false
      };
    case 'FOUND_OUT_OF_STOCK':
      return {
        customerMessage: result.message,
        showProduct: true,
        showPrice: false
      };
    case 'FOUND_AVAILABLE':
      return {
        customerMessage: '',
        showProduct: true,
        showPrice: true
      };
    default:
      return {
        customerMessage: 'حدث خطأ غير متوقع.',
        showProduct: false,
        showPrice: false
      };
  }
}
