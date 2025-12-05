import { MockApi } from './mockApi';
import {
    ConfigurablePriceLevel,
    ProductPriceEntry,
    CustomerPricingProfile,
    GlobalPricingSettings,
    PriceCalculationResult,
    PricePrecedenceOption,
    CustomerCustomPriceRule
} from '../types';

/**
 * Central Pricing Engine (محرك التسعير المركزي)
 * 
 * This engine calculates effective prices based on:
 * - Global pricing settings (currency, rounding, precedence order)
 * - Price levels (base and derived levels)
 * - Product price matrix (explicit prices per product per level)
 * - Customer pricing profiles (customer-specific rules and adjustments)
 * 
 * All pricing behavior is configurable from the admin UI - no hard-coded values.
 */

// Cache for frequently accessed data (cleared on updates)
let cachedSettings: GlobalPricingSettings | null = null;
let cachedLevels: ConfigurablePriceLevel[] | null = null;
let cachedMatrix: ProductPriceEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds cache

/**
 * Invalidate the pricing cache
 */
export const invalidatePricingCache = () => {
    cachedSettings = null;
    cachedLevels = null;
    cachedMatrix = null;
    cacheTimestamp = 0;
};

/**
 * Load all pricing data with caching
 */
const loadPricingData = async (): Promise<{
    settings: GlobalPricingSettings;
    levels: ConfigurablePriceLevel[];
    matrix: ProductPriceEntry[];
}> => {
    const now = Date.now();
    
    if (cachedSettings && cachedLevels && cachedMatrix && (now - cacheTimestamp) < CACHE_TTL) {
        return { settings: cachedSettings, levels: cachedLevels, matrix: cachedMatrix };
    }
    
    const [settings, levels, matrix] = await Promise.all([
        MockApi.getGlobalPricingSettings(),
        MockApi.getPriceLevels(),
        MockApi.getProductPriceMatrix()
    ]);
    
    cachedSettings = settings;
    cachedLevels = levels;
    cachedMatrix = matrix;
    cacheTimestamp = now;
    
    return { settings, levels, matrix };
};

/**
 * Apply rounding based on global settings
 */
const applyRounding = (price: number, settings: GlobalPricingSettings): number => {
    const { roundingMode, roundingDecimals } = settings;
    const multiplier = Math.pow(10, roundingDecimals);
    
    switch (roundingMode) {
        case 'ROUND':
            return Math.round(price * multiplier) / multiplier;
        case 'CEIL':
            return Math.ceil(price * multiplier) / multiplier;
        case 'FLOOR':
            return Math.floor(price * multiplier) / multiplier;
        case 'NONE':
        default:
            return price;
    }
};

/**
 * Get explicit price from the price matrix
 */
const getExplicitPrice = (
    productId: string,
    levelId: string,
    matrix: ProductPriceEntry[]
): number | null => {
    const entry = matrix.find(e => e.productId === productId && e.priceLevelId === levelId);
    return entry ? entry.price : null;
};

/**
 * Calculate derived price from a base level
 */
const getDerivedPrice = (
    productId: string,
    level: ConfigurablePriceLevel,
    levels: ConfigurablePriceLevel[],
    matrix: ProductPriceEntry[],
    visitedLevels: Set<string> = new Set()
): number | null => {
    // Prevent circular references
    if (visitedLevels.has(level.id)) {
        return null;
    }
    visitedLevels.add(level.id);
    
    // If base level, try to get explicit price
    if (level.isBaseLevel) {
        return getExplicitPrice(productId, level.id, matrix);
    }
    
    // If derived level, calculate from base
    if (!level.baseLevelId || !level.adjustmentType || level.adjustmentValue === undefined) {
        return null;
    }
    
    const baseLevel = levels.find(l => l.id === level.baseLevelId);
    if (!baseLevel) return null;
    
    // First try explicit price for base level
    let basePrice = getExplicitPrice(productId, baseLevel.id, matrix);
    
    // If no explicit price, try derived price for base level
    if (basePrice === null) {
        basePrice = getDerivedPrice(productId, baseLevel, levels, matrix, visitedLevels);
    }
    
    if (basePrice === null) return null;
    
    // Apply adjustment
    if (level.adjustmentType === 'PERCENT') {
        return basePrice * (1 + level.adjustmentValue / 100);
    } else if (level.adjustmentType === 'FIXED') {
        return basePrice + level.adjustmentValue;
    }
    
    return basePrice;
};

/**
 * Get price for a specific level (explicit or derived)
 */
const getPriceForLevel = (
    productId: string,
    levelId: string,
    levels: ConfigurablePriceLevel[],
    matrix: ProductPriceEntry[]
): number | null => {
    const level = levels.find(l => l.id === levelId);
    if (!level || !level.isActive) return null;
    
    // Try explicit price first
    const explicitPrice = getExplicitPrice(productId, levelId, matrix);
    if (explicitPrice !== null) return explicitPrice;
    
    // Try derived price
    return getDerivedPrice(productId, level, levels, matrix);
};

/**
 * Apply custom rule pricing
 */
const applyCustomRule = (
    rule: CustomerCustomPriceRule,
    productId: string,
    levels: ConfigurablePriceLevel[],
    matrix: ProductPriceEntry[]
): number | null => {
    // Check if rule applies to this product
    if (rule.productId && rule.productId !== productId) return null;
    
    // Check validity period
    const now = new Date();
    if (rule.validFrom && new Date(rule.validFrom) > now) return null;
    if (rule.validTo && new Date(rule.validTo) < now) return null;
    
    // Fixed price rule
    if (rule.useFixedPrice && rule.fixedPrice !== undefined) {
        return rule.fixedPrice;
    }
    
    // Percent of level rule
    if (rule.usePercentOfLevel && rule.percentOfLevel !== undefined && rule.priceLevelIdForPercent) {
        const levelPrice = getPriceForLevel(productId, rule.priceLevelIdForPercent, levels, matrix);
        if (levelPrice !== null) {
            return levelPrice * (rule.percentOfLevel / 100);
        }
    }
    
    return null;
};

/**
 * Main pricing function - Get effective price for a customer
 */
export const getEffectivePriceForCustomer = async (
    productId: string,
    customerId: string | null,
    quantity: number = 1
): Promise<PriceCalculationResult> => {
    const result: PriceCalculationResult = {
        finalPrice: null,
        basePrice: null,
        sourcePrecedence: null,
        sourceLevelId: null,
        roundingApplied: false,
        calculationSteps: []
    };
    
    try {
        const { settings, levels, matrix } = await loadPricingData();
        result.calculationSteps.push('تم تحميل بيانات التسعير');
        
        // Get customer pricing profile if available
        let profile: CustomerPricingProfile | null = null;
        if (customerId) {
            profile = await MockApi.getCustomerPricingProfile(customerId);
            if (profile) {
                result.calculationSteps.push(`تم العثور على ملف تسعير للعميل: ${customerId}`);
            }
        }
        
        // Determine the target price level
        let targetLevelId: string | null = null;
        if (profile?.defaultPriceLevelId) {
            targetLevelId = profile.defaultPriceLevelId;
            result.calculationSteps.push(`استخدام مستوى العميل: ${targetLevelId}`);
        } else if (settings.defaultPriceLevelId) {
            targetLevelId = settings.defaultPriceLevelId;
            result.calculationSteps.push(`استخدام المستوى الافتراضي: ${targetLevelId}`);
        }
        
        const targetLevel = levels.find(l => l.id === targetLevelId);
        if (targetLevel) {
            result.sourceLevelName = targetLevel.name;
        }
        
        let basePrice: number | null = null;
        
        // Apply precedence order
        for (const precedence of settings.pricePrecedenceOrder) {
            if (basePrice !== null) break;
            
            switch (precedence) {
                case 'CUSTOM_RULE':
                    if (profile?.allowCustomRules && profile.customRules?.length) {
                        for (const rule of profile.customRules) {
                            const rulePrice = applyCustomRule(rule, productId, levels, matrix);
                            if (rulePrice !== null) {
                                basePrice = rulePrice;
                                result.sourcePrecedence = 'CUSTOM_RULE';
                                result.calculationSteps.push(`تطبيق قاعدة مخصصة - السعر: ${rulePrice}`);
                                break;
                            }
                        }
                    }
                    break;
                    
                case 'LEVEL_EXPLICIT':
                    if (targetLevelId) {
                        const explicitPrice = getExplicitPrice(productId, targetLevelId, matrix);
                        if (explicitPrice !== null) {
                            basePrice = explicitPrice;
                            result.sourcePrecedence = 'LEVEL_EXPLICIT';
                            result.sourceLevelId = targetLevelId;
                            result.calculationSteps.push(`سعر صريح من المستوى ${targetLevelId}: ${explicitPrice}`);
                        }
                    }
                    break;
                    
                case 'LEVEL_DERIVED':
                    if (targetLevelId) {
                        const level = levels.find(l => l.id === targetLevelId);
                        if (level && !level.isBaseLevel) {
                            const derivedPrice = getDerivedPrice(productId, level, levels, matrix);
                            if (derivedPrice !== null) {
                                basePrice = derivedPrice;
                                result.sourcePrecedence = 'LEVEL_DERIVED';
                                result.sourceLevelId = targetLevelId;
                                result.calculationSteps.push(`سعر مشتق من المستوى ${level.baseLevelId}: ${derivedPrice}`);
                            }
                        }
                    }
                    break;
            }
        }
        
        // Fallback to other levels if allowed
        if (basePrice === null && settings.allowFallbackToOtherLevels) {
            const fallbackLevelId = settings.fallbackLevelId || 
                levels.find(l => l.isBaseLevel && l.isActive)?.id;
            
            if (fallbackLevelId && fallbackLevelId !== targetLevelId) {
                basePrice = getPriceForLevel(productId, fallbackLevelId, levels, matrix);
                if (basePrice !== null) {
                    result.sourceLevelId = fallbackLevelId;
                    result.calculationSteps.push(`استخدام مستوى احتياطي ${fallbackLevelId}: ${basePrice}`);
                }
            }
        }
        
        if (basePrice === null) {
            result.calculationSteps.push('لم يتم العثور على سعر');
            return result;
        }
        
        result.basePrice = basePrice;
        let finalPrice = basePrice;
        
        // Apply customer markup/discount
        if (profile) {
            const markup = profile.extraMarkupPercent || 0;
            const discount = profile.extraDiscountPercent || 0;
            
            if (!settings.allowNegativeDiscounts && discount > markup) {
                result.calculationSteps.push('تجاوز الخصم غير مسموح - تم تقييد الخصم');
            }
            
            const effectiveDiscount = settings.allowNegativeDiscounts ? discount : Math.min(discount, markup);
            const adjustment = markup - effectiveDiscount;
            
            if (adjustment !== 0) {
                finalPrice = finalPrice * (1 + adjustment / 100);
                result.appliedMarkup = markup;
                result.appliedDiscount = effectiveDiscount;
                result.calculationSteps.push(`تطبيق هامش ${markup}% وخصم ${effectiveDiscount}%`);
            }
            
            // Apply floor/ceiling from profile
            if (profile.priceFloor && finalPrice < profile.priceFloor) {
                finalPrice = profile.priceFloor;
                result.calculationSteps.push(`تطبيق حد أدنى للسعر: ${profile.priceFloor}`);
            }
            if (profile.priceCeiling && finalPrice > profile.priceCeiling) {
                finalPrice = profile.priceCeiling;
                result.calculationSteps.push(`تطبيق حد أقصى للسعر: ${profile.priceCeiling}`);
            }
        }
        
        // Apply global floor/ceiling
        if (settings.minPriceFloor && finalPrice < settings.minPriceFloor) {
            finalPrice = settings.minPriceFloor;
            result.calculationSteps.push(`تطبيق حد أدنى عام: ${settings.minPriceFloor}`);
        }
        if (settings.maxPriceCeiling && finalPrice > settings.maxPriceCeiling) {
            finalPrice = settings.maxPriceCeiling;
            result.calculationSteps.push(`تطبيق حد أقصى عام: ${settings.maxPriceCeiling}`);
        }
        
        // Apply volume discounts
        if (settings.enableVolumeDiscounts && settings.volumeDiscountRules?.length) {
            for (const rule of settings.volumeDiscountRules) {
                if (!rule.isActive) continue;
                if (quantity < rule.minQty) continue;
                if (rule.maxQty && quantity > rule.maxQty) continue;
                
                // Check if product applies
                if (!rule.appliesToAllProducts) {
                    if (rule.productIds && !rule.productIds.includes(productId)) continue;
                }
                
                if (rule.discountType === 'PERCENT') {
                    const volumeDiscount = finalPrice * (rule.discountValue / 100);
                    finalPrice -= volumeDiscount;
                    result.appliedVolumeDiscount = rule.discountValue;
                    result.calculationSteps.push(`خصم كمية ${rule.discountValue}%`);
                } else if (rule.discountType === 'FIXED') {
                    finalPrice -= rule.discountValue;
                    result.appliedVolumeDiscount = rule.discountValue;
                    result.calculationSteps.push(`خصم كمية ثابت: ${rule.discountValue}`);
                }
                break; // Apply only first matching rule
            }
        }
        
        // Apply time-based promotions
        if (settings.enableTimePromotions && settings.timePromotions?.length) {
            const now = new Date();
            for (const promo of settings.timePromotions) {
                if (!promo.isActive) continue;
                if (new Date(promo.startsAt) > now || new Date(promo.endsAt) < now) continue;
                
                // Check if product applies
                if (!promo.appliesToAllProducts) {
                    if (promo.productIds && !promo.productIds.includes(productId)) continue;
                }
                
                // Check if level applies
                if (promo.priceLevelIds?.length && result.sourceLevelId) {
                    if (!promo.priceLevelIds.includes(result.sourceLevelId)) continue;
                }
                
                if (promo.discountType === 'PERCENT') {
                    finalPrice -= finalPrice * (promo.discountValue / 100);
                    result.appliedPromotion = promo.name;
                    result.calculationSteps.push(`عرض ${promo.name}: خصم ${promo.discountValue}%`);
                } else if (promo.discountType === 'FIXED') {
                    finalPrice -= promo.discountValue;
                    result.appliedPromotion = promo.name;
                    result.calculationSteps.push(`عرض ${promo.name}: خصم ${promo.discountValue}`);
                }
                break; // Apply only first matching promotion
            }
        }
        
        // Apply rounding
        if (settings.roundingMode !== 'NONE') {
            const roundedPrice = applyRounding(finalPrice, settings);
            if (roundedPrice !== finalPrice) {
                result.roundingApplied = true;
                result.calculationSteps.push(`تقريب من ${finalPrice} إلى ${roundedPrice}`);
            }
            finalPrice = roundedPrice;
        }
        
        // Ensure price is not negative
        if (finalPrice < 0) {
            finalPrice = 0;
            result.calculationSteps.push('تصحيح السعر السالب إلى صفر');
        }
        
        result.finalPrice = finalPrice;
        result.calculationSteps.push(`السعر النهائي: ${finalPrice}`);
        
    } catch (error) {
        console.error('Error calculating price:', error);
        result.errors = [`خطأ في حساب السعر: ${error}`];
    }
    
    return result;
};

/**
 * Get prices for multiple products at once (batch operation)
 */
export const getBatchPricesForCustomer = async (
    productIds: string[],
    customerId: string | null
): Promise<Map<string, PriceCalculationResult>> => {
    const results = new Map<string, PriceCalculationResult>();
    
    // Load data once for all products
    await loadPricingData();
    
    // Calculate price for each product
    await Promise.all(
        productIds.map(async (productId) => {
            const result = await getEffectivePriceForCustomer(productId, customerId);
            results.set(productId, result);
        })
    );
    
    return results;
};

/**
 * Simulate price calculation for admin testing
 */
export const simulatePriceCalculation = async (
    productId: string,
    customerId: string | null,
    quantity?: number
): Promise<PriceCalculationResult> => {
    return getEffectivePriceForCustomer(productId, customerId, quantity);
};

/**
 * Get all prices for a product across all levels
 */
export const getAllPricesForProduct = async (
    productId: string
): Promise<Array<{ levelId: string; levelName: string; price: number | null }>> => {
    const { levels, matrix } = await loadPricingData();
    
    return levels
        .filter(l => l.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(level => ({
            levelId: level.id,
            levelName: level.name,
            price: getPriceForLevel(productId, level.id, levels, matrix)
        }));
};
