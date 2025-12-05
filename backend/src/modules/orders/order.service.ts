import { orderRepository, OrderFilters } from './order.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import { CreateOrderInput, UpdateOrderStatusInput, CreateQuoteRequestInput } from '../../schemas/order.schema';
import { OrderStatus, OrderInternalStatus } from '../../types/enums';

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['SHIPPED', 'CANCELLED'],
  REJECTED: [],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

const INTERNAL_STATUS_FLOW: OrderInternalStatus[] = [
  'NEW',
  'SENT_TO_WAREHOUSE',
  'WAITING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'SALES_INVOICE_CREATED',
  'READY_FOR_SHIPMENT',
  'COMPLETED_INTERNAL'
];

export class OrderService {
  async list(filters: OrderFilters, pagination: PaginationParams) {
    return orderRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('الطلب غير موجود');
    }
    return order;
  }

  async getByUser(userId: string, pagination: PaginationParams) {
    return orderRepository.findByUserId(userId, pagination);
  }

  async create(userId: string, input: CreateOrderInput, businessId?: string) {
    const items = await Promise.all(
      input.items.map(async (item) => {
        const product = await orderRepository.findProductByPartNumber(item.partNumber);
        return {
          productId: product?.id || item.productId,
          partNumber: item.partNumber,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        };
      })
    );

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = await orderRepository.create({
      userId,
      businessId,
      branchId: input.branchId,
      totalAmount,
      items
    });

    return order;
  }

  async updateStatus(orderId: string, changedBy: string, input: UpdateOrderStatusInput) {
    const order = await this.getById(orderId);

    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status as OrderStatus];
    if (!allowedTransitions.includes(input.status as OrderStatus)) {
      throw new BadRequestError(
        `لا يمكن تغيير حالة الطلب من ${order.status} إلى ${input.status}`
      );
    }

    await orderRepository.updateStatus(orderId, input.status, changedBy, input.note);

    return orderRepository.findById(orderId);
  }

  async updateInternalStatus(orderId: string, internalStatus: OrderInternalStatus, notes?: string) {
    const order = await this.getById(orderId);

    const currentIndex = INTERNAL_STATUS_FLOW.indexOf(order.internalStatus as OrderInternalStatus);
    const newIndex = INTERNAL_STATUS_FLOW.indexOf(internalStatus as OrderInternalStatus);

    if (newIndex < currentIndex && internalStatus !== 'CANCELLED_INTERNAL') {
      throw new BadRequestError('لا يمكن الرجوع لحالة سابقة');
    }

    await orderRepository.updateInternalStatus(orderId, internalStatus, notes);

    return orderRepository.findById(orderId);
  }

  async cancel(orderId: string, cancelledBy: string, reason?: string) {
    const order = await this.getById(orderId);

    if (!['PENDING', 'APPROVED'].includes(order.status)) {
      throw new BadRequestError('لا يمكن إلغاء الطلب في هذه الحالة');
    }

    await orderRepository.updateStatus(orderId, 'CANCELLED', cancelledBy, reason);

    return orderRepository.findById(orderId);
  }

  async delete(orderId: string, userId: string) {
    const order = await this.getById(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenError('لا يمكنك حذف طلب آخر');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestError('لا يمكن حذف طلب تم معالجته');
    }

    await orderRepository.delete(orderId);

    return { message: 'تم حذف الطلب بنجاح' };
  }

  async getQuoteRequests(filters: { userId?: string; status?: any }, pagination: PaginationParams) {
    return orderRepository.findQuoteRequests(filters, pagination);
  }

  async getQuoteById(id: string) {
    const quote = await orderRepository.findQuoteById(id);
    if (!quote) {
      throw new NotFoundError('طلب عرض السعر غير موجود');
    }
    return quote;
  }

  async createQuoteRequest(userId: string, userName: string, companyName: string, input: CreateQuoteRequestInput) {
    return orderRepository.createQuoteRequest({
      userId,
      userName,
      companyName,
      priceType: input.priceType,
      items: input.items
    });
  }

  async processQuote(quoteId: string) {
    const quote = await this.getQuoteById(quoteId);

    for (const item of quote.items) {
      const product = await orderRepository.findProductByPartNumber(item.partNumber);
      
      if (product) {
        await orderRepository.updateQuoteItem(item.id, {
          product: { connect: { id: product.id } },
          matchedPrice: product.priceWholesale,
          status: 'MATCHED'
        });
      } else {
        await orderRepository.updateQuoteItem(item.id, {
          status: 'NOT_FOUND'
        });
      }
    }

    await orderRepository.updateQuoteStatus(quoteId, 'COMPLETED');

    return orderRepository.findQuoteById(quoteId);
  }

  async updateQuoteStatus(quoteId: string, status: any) {
    await this.getQuoteById(quoteId);
    await orderRepository.updateQuoteStatus(quoteId, status);
    return orderRepository.findQuoteById(quoteId);
  }

  async searchProducts(search: string, limit: number = 20) {
    return orderRepository.findProducts(search, limit);
  }

  async getOrderStats(userId?: string) {
    const filters: OrderFilters = userId ? { userId } : {};
    const allOrders = await orderRepository.findMany(filters, { page: 1, limit: 1000 });

    const stats = {
      total: allOrders.pagination.total,
      pending: 0,
      approved: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalAmount: 0
    };

    allOrders.data.forEach(order => {
      stats[order.status.toLowerCase() as keyof typeof stats]++;
      stats.totalAmount += order.totalAmount;
    });

    return stats;
  }
}

export const orderService = new OrderService();
