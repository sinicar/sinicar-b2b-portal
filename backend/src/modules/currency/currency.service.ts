import prisma from '../../lib/prisma';
import { Currency, ExchangeRate } from '@prisma/client';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  syncPercent: number;
}

export class CurrencyService {
  async getBaseCurrency(): Promise<Currency | null> {
    return prisma.currency.findFirst({
      where: { isBase: true, isActive: true }
    });
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return prisma.currency.findMany({
      where: { isActive: true },
      orderBy: [{ isBase: 'desc' }, { sortOrder: 'asc' }]
    });
  }

  async getCurrencyByCode(code: string): Promise<Currency | null> {
    return prisma.currency.findUnique({
      where: { code: code.toUpperCase() }
    });
  }

  async getExchangeRate(currencyCode: string): Promise<ExchangeRate | null> {
    const currency = await this.getCurrencyByCode(currencyCode);
    if (!currency) return null;

    return prisma.exchangeRate.findFirst({
      where: {
        currencyId: currency.id,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ]
      },
      orderBy: { effectiveFrom: 'desc' }
    });
  }

  async convertToBase(amount: number, fromCurrencyCode: string): Promise<ConversionResult> {
    const baseCurrency = await this.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('Base currency not configured');
    }

    if (fromCurrencyCode.toUpperCase() === baseCurrency.code) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrencyCode,
        convertedAmount: amount,
        targetCurrency: baseCurrency.code,
        exchangeRate: 1,
        syncPercent: 100
      };
    }

    const rate = await this.getExchangeRate(fromCurrencyCode);
    if (!rate) {
      throw new Error(`Exchange rate not found for ${fromCurrencyCode}`);
    }

    const effectiveRate = rate.rateToBase * (rate.syncPercent / 100);
    const convertedAmount = amount * effectiveRate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrencyCode,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      targetCurrency: baseCurrency.code,
      exchangeRate: effectiveRate,
      syncPercent: rate.syncPercent
    };
  }

  async convertFromBase(amount: number, toCurrencyCode: string): Promise<ConversionResult> {
    const baseCurrency = await this.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('Base currency not configured');
    }

    if (toCurrencyCode.toUpperCase() === baseCurrency.code) {
      return {
        originalAmount: amount,
        originalCurrency: baseCurrency.code,
        convertedAmount: amount,
        targetCurrency: toCurrencyCode,
        exchangeRate: 1,
        syncPercent: 100
      };
    }

    const rate = await this.getExchangeRate(toCurrencyCode);
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrencyCode}`);
    }

    const effectiveRate = rate.rateToBase * (rate.syncPercent / 100);
    const convertedAmount = amount / effectiveRate;

    return {
      originalAmount: amount,
      originalCurrency: baseCurrency.code,
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      targetCurrency: toCurrencyCode,
      exchangeRate: 1 / effectiveRate,
      syncPercent: rate.syncPercent
    };
  }

  async convert(amount: number, fromCurrency: string, toCurrency: string): Promise<ConversionResult> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) {
      return {
        originalAmount: amount,
        originalCurrency: from,
        convertedAmount: amount,
        targetCurrency: to,
        exchangeRate: 1,
        syncPercent: 100
      };
    }

    const baseCurrency = await this.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('Base currency not configured');
    }

    const baseResult = await this.convertToBase(amount, from);
    
    if (to === baseCurrency.code) {
      return baseResult;
    }

    return this.convertFromBase(baseResult.convertedAmount, to);
  }

  async createCurrency(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    symbol: string;
    isBase?: boolean;
  }): Promise<Currency> {
    if (data.isBase) {
      await prisma.currency.updateMany({
        where: { isBase: true },
        data: { isBase: false }
      });
    }

    return prisma.currency.create({
      data: {
        ...data,
        code: data.code.toUpperCase()
      }
    });
  }

  async updateExchangeRate(currencyCode: string, rateToBase: number, syncPercent: number = 100, updatedBy?: string): Promise<ExchangeRate> {
    const currency = await this.getCurrencyByCode(currencyCode);
    if (!currency) {
      throw new Error(`Currency not found: ${currencyCode}`);
    }

    await prisma.exchangeRate.updateMany({
      where: { currencyId: currency.id, isActive: true },
      data: { isActive: false, effectiveTo: new Date() }
    });

    return prisma.exchangeRate.create({
      data: {
        currencyId: currency.id,
        rateToBase,
        syncPercent,
        updatedBy,
        effectiveFrom: new Date()
      }
    });
  }
}

export const currencyService = new CurrencyService();
