import { prisma } from '../../lib/prisma';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  customerId?: string;
  supplierId?: string;
  status?: string;
  category?: string;
  [key: string]: string | undefined;
}

export interface ReportResult {
  success: boolean;
  data: any;
  metadata: {
    generatedAt: string;
    filters: ReportFilters;
    rowCount: number;
  };
}

export interface ReportHandler {
  code: string;
  handler: (filters: ReportFilters, userId: string) => Promise<ReportResult>;
}

class ReportRegistry {
  private handlers: Map<string, ReportHandler> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    this.register({
      code: 'QUOTES_OVERVIEW',
      handler: async (filters, userId) => {
        const PAGE_SIZE = 50;
        const page = parseInt(filters.page || '1', 10);
        const skip = (page - 1) * PAGE_SIZE;

        const whereClause: any = {};

        if (filters.dateFrom) {
          whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
          const endDate = new Date(filters.dateTo);
          endDate.setHours(23, 59, 59, 999);
          whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
        }
        if (filters.customerId) {
          whereClause.userId = filters.customerId;
        }
        if (filters.status) {
          whereClause.status = filters.status;
        }

        const [quotes, totalCount] = await Promise.all([
          prisma.quoteRequest.findMany({
            where: whereClause,
            include: {
              items: true,
              user: { select: { id: true, name: true, companyName: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: PAGE_SIZE
          }),
          prisma.quoteRequest.count({ where: whereClause })
        ]);

        const allQuotesForAggregation = await prisma.quoteRequest.findMany({
          where: whereClause,
          include: { items: true, user: { select: { id: true, name: true, companyName: true } } }
        });

        const statusCounts: Record<string, number> = {};
        const customerAggregation: Record<string, { customerId: string; customerName: string; count: number; totalAmount: number }> = {};
        let totalApproved = 0;
        let totalRejected = 0;
        let totalPending = 0;
        let totalAmountApproved = 0;

        for (const quote of allQuotesForAggregation) {
          const status = quote.status || 'UNKNOWN';
          statusCounts[status] = (statusCounts[status] || 0) + 1;

          const quoteTotal = quote.items.reduce((sum, item) => sum + (item.matchedPrice || 0) * item.requestedQty, 0);

          if (status === 'APPROVED' || status === 'COMPLETED') {
            totalApproved++;
            totalAmountApproved += quoteTotal;
          } else if (status === 'REJECTED' || status === 'CANCELLED') {
            totalRejected++;
          } else {
            totalPending++;
          }

          const custId = quote.userId;
          const custName = quote.user?.name || quote.userName || quote.companyName || 'Unknown Customer';
          if (!customerAggregation[custId]) {
            customerAggregation[custId] = { customerId: custId, customerName: custName, count: 0, totalAmount: 0 };
          }
          customerAggregation[custId].count++;
          customerAggregation[custId].totalAmount += quoteTotal;
        }

        const byStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
        const byCustomer = Object.values(customerAggregation).sort((a, b) => b.count - a.count).slice(0, 10);

        const rows = quotes.map(q => ({
          id: q.id,
          number: q.id.slice(0, 8).toUpperCase(),
          customerName: q.user?.name || q.userName || q.companyName || 'Unknown',
          status: q.status,
          amount: q.items.reduce((sum, item) => sum + (item.matchedPrice || 0) * item.requestedQty, 0),
          createdAt: q.createdAt.toISOString()
        }));

        return {
          success: true,
          data: {
            summary: {
              totalQuotes: allQuotesForAggregation.length,
              totalApproved,
              totalRejected,
              totalPending,
              totalAmountApproved: Math.round(totalAmountApproved * 100) / 100
            },
            byStatus,
            byCustomer,
            rows,
            pagination: {
              page,
              pageSize: PAGE_SIZE,
              totalCount,
              totalPages: Math.ceil(totalCount / PAGE_SIZE)
            }
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: rows.length
          }
        };
      }
    });

    this.register({
      code: 'SALES_SUMMARY',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalSales: 125000,
            totalOrders: 45,
            averageOrderValue: 2777.78,
            topProducts: [
              { name: 'قطعة غيار 1', quantity: 15, revenue: 25000 },
              { name: 'قطعة غيار 2', quantity: 12, revenue: 18000 },
              { name: 'قطعة غيار 3', quantity: 10, revenue: 15000 }
            ],
            salesByDay: [
              { date: '2024-01-01', total: 5000 },
              { date: '2024-01-02', total: 7500 },
              { date: '2024-01-03', total: 3000 }
            ]
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 3
          }
        };
      }
    });

    this.register({
      code: 'QUOTES_STATUS',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalQuotes: 128,
            byStatus: {
              pending: 25,
              approved: 78,
              rejected: 15,
              expired: 10
            },
            averageResponseTime: '4.5 hours',
            conversionRate: 60.94
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 4
          }
        };
      }
    });

    this.register({
      code: 'SUPPLIER_PERFORMANCE',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalSuppliers: 45,
            activeSuppliers: 38,
            averageRating: 4.2,
            topPerformers: [
              { name: 'مورد 1', rating: 4.9, ordersCompleted: 120 },
              { name: 'مورد 2', rating: 4.7, ordersCompleted: 95 },
              { name: 'مورد 3', rating: 4.5, ordersCompleted: 80 }
            ],
            responseTimeAvg: '2.3 hours'
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 3
          }
        };
      }
    });

    this.register({
      code: 'STOCK_LEVELS',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalProducts: 1250,
            lowStockItems: 23,
            outOfStockItems: 5,
            stockValue: 2500000,
            topCategories: [
              { name: 'محركات', count: 450, value: 850000 },
              { name: 'فرامل', count: 320, value: 420000 },
              { name: 'كهرباء', count: 280, value: 350000 }
            ]
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 3
          }
        };
      }
    });

    this.register({
      code: 'CUSTOMER_ACTIVITY',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalCustomers: 890,
            activeCustomers: 650,
            newCustomersThisMonth: 45,
            retentionRate: 73.03,
            averageOrdersPerCustomer: 3.2
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 5
          }
        };
      }
    });

    this.register({
      code: 'REVENUE_BREAKDOWN',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalRevenue: 5250000,
            byCategory: {
              'قطع غيار': 2500000,
              'خدمات': 1200000,
              'شحن': 850000,
              'أخرى': 700000
            },
            byMonth: [
              { month: 'يناير', revenue: 420000 },
              { month: 'فبراير', revenue: 380000 },
              { month: 'مارس', revenue: 450000 }
            ],
            growthRate: 12.5
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 4
          }
        };
      }
    });

    this.register({
      code: 'ORDER_FULFILLMENT',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalOrders: 1580,
            fulfilled: 1450,
            pending: 80,
            cancelled: 50,
            fulfillmentRate: 91.77,
            averageFulfillmentTime: '48 hours'
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 6
          }
        };
      }
    });

    this.register({
      code: 'USER_AUDIT_LOG',
      handler: async (filters, userId) => {
        return {
          success: true,
          data: {
            totalEvents: 15420,
            eventTypes: {
              LOGIN: 5200,
              LOGOUT: 4800,
              ORDER_CREATE: 2100,
              ORDER_UPDATE: 1800,
              SETTINGS_CHANGE: 520,
              OTHER: 1000
            },
            recentActivity: [
              { user: 'admin', action: 'LOGIN', timestamp: new Date().toISOString() },
              { user: 'user1', action: 'ORDER_CREATE', timestamp: new Date().toISOString() },
              { user: 'admin', action: 'SETTINGS_CHANGE', timestamp: new Date().toISOString() }
            ]
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            filters,
            rowCount: 3
          }
        };
      }
    });
  }

  register(handler: ReportHandler) {
    this.handlers.set(handler.code, handler);
  }

  getHandler(code: string): ReportHandler | undefined {
    return this.handlers.get(code);
  }

  hasHandler(code: string): boolean {
    return this.handlers.has(code);
  }
}

export const reportRegistry = new ReportRegistry();

export class ReportService {
  async getDefinitionsForUser(userRole: string): Promise<any[]> {
    const definitions = await prisma.reportDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    return definitions.filter(def => {
      if (!def.allowedRoles || def.allowedRoles.length === 0) {
        return true;
      }
      return def.allowedRoles.includes(userRole) || def.allowedRoles.includes('*');
    });
  }

  async getDefinitionByCode(code: string): Promise<any | null> {
    return prisma.reportDefinition.findUnique({
      where: { code }
    });
  }

  async runReport(
    code: string,
    filters: ReportFilters,
    userId: string,
    userRole: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const startTime = Date.now();

    const definition = await this.getDefinitionByCode(code);
    if (!definition) {
      return { success: false, error: 'Report not found' };
    }

    if (!definition.isActive) {
      return { success: false, error: 'Report is not active' };
    }

    if (definition.allowedRoles && definition.allowedRoles.length > 0) {
      if (!definition.allowedRoles.includes(userRole) && !definition.allowedRoles.includes('*')) {
        return { success: false, error: 'Access denied to this report' };
      }
    }

    const handler = reportRegistry.getHandler(code);
    if (!handler) {
      return { success: false, error: 'Report handler not implemented' };
    }

    try {
      const result = await handler.handler(filters, userId);
      const durationMs = Date.now() - startTime;

      await this.logExecution(code, userId, filters, 'SUCCESS', durationMs);

      return { success: true, data: result };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      await this.logExecution(code, userId, filters, 'FAILED', durationMs, error.message);
      return { success: false, error: error.message || 'Report execution failed' };
    }
  }

  private async logExecution(
    reportCode: string,
    userId: string,
    filters: ReportFilters,
    status: 'SUCCESS' | 'FAILED',
    durationMs: number,
    errorMessage?: string
  ) {
    const filtersSummary = this.summarizeFilters(filters);

    try {
      await prisma.reportExecutionLog.create({
        data: {
          reportCode,
          userId,
          filtersSummary,
          status,
          durationMs,
          errorMessage
        }
      });
    } catch (e) {
      console.error('Failed to log report execution:', e);
    }
  }

  private summarizeFilters(filters: ReportFilters): string {
    const entries = Object.entries(filters).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) return 'no filters';
    
    const summary = entries.map(([k, v]) => `${k}=${v}`).join(', ');
    return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
  }

  async getExecutionLogs(
    reportCode?: string,
    limit: number = 50
  ): Promise<any[]> {
    return prisma.reportExecutionLog.findMany({
      where: reportCode ? { reportCode } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export const reportService = new ReportService();
