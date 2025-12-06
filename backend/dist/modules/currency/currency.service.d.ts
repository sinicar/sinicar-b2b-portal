import { Currency, ExchangeRate } from '@prisma/client';
export interface ConversionResult {
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    targetCurrency: string;
    exchangeRate: number;
    syncPercent: number;
}
export declare class CurrencyService {
    getBaseCurrency(): Promise<Currency | null>;
    getAllCurrencies(): Promise<Currency[]>;
    getAllExchangeRates(): Promise<({
        currency: {
            symbol: string;
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            code: string;
            sortOrder: number;
            nameEn: string | null;
            nameAr: string | null;
            isBase: boolean;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currencyId: string;
        rateToBase: number;
        syncPercent: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        updatedBy: string | null;
    })[]>;
    getCurrencyByCode(code: string): Promise<Currency | null>;
    getExchangeRate(currencyCode: string): Promise<ExchangeRate | null>;
    convertToBase(amount: number, fromCurrencyCode: string): Promise<ConversionResult>;
    convertFromBase(amount: number, toCurrencyCode: string): Promise<ConversionResult>;
    convert(amount: number, fromCurrency: string, toCurrency: string): Promise<ConversionResult>;
    createCurrency(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        symbol: string;
        isBase?: boolean;
    }): Promise<Currency>;
    updateExchangeRate(currencyCode: string, rateToBase: number, syncPercent?: number, updatedBy?: string): Promise<ExchangeRate>;
}
export declare const currencyService: CurrencyService;
//# sourceMappingURL=currency.service.d.ts.map