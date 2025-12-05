"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_repository_1 = require("./order.repository");
const errors_1 = require("../../utils/errors");
const ORDER_STATUS_TRANSITIONS = {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['SHIPPED', 'CANCELLED'],
    REJECTED: [],
    SHIPPED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: []
};
const INTERNAL_STATUS_FLOW = [
    'NEW',
    'SENT_TO_WAREHOUSE',
    'WAITING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'SALES_INVOICE_CREATED',
    'READY_FOR_SHIPMENT',
    'COMPLETED_INTERNAL'
];
class OrderService {
    async list(filters, pagination) {
        return order_repository_1.orderRepository.findMany(filters, pagination);
    }
    async getById(id) {
        const order = await order_repository_1.orderRepository.findById(id);
        if (!order) {
            throw new errors_1.NotFoundError('الطلب غير موجود');
        }
        return order;
    }
    async getByUser(userId, pagination) {
        return order_repository_1.orderRepository.findByUserId(userId, pagination);
    }
    async create(userId, input, businessId) {
        const items = await Promise.all(input.items.map(async (item) => {
            const product = await order_repository_1.orderRepository.findProductByPartNumber(item.partNumber);
            return {
                productId: product?.id || item.productId,
                partNumber: item.partNumber,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice
            };
        }));
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const order = await order_repository_1.orderRepository.create({
            userId,
            businessId,
            branchId: input.branchId,
            totalAmount,
            items
        });
        return order;
    }
    async updateStatus(orderId, changedBy, input) {
        const order = await this.getById(orderId);
        const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
        if (!allowedTransitions.includes(input.status)) {
            throw new errors_1.BadRequestError(`لا يمكن تغيير حالة الطلب من ${order.status} إلى ${input.status}`);
        }
        await order_repository_1.orderRepository.updateStatus(orderId, input.status, changedBy, input.note);
        return order_repository_1.orderRepository.findById(orderId);
    }
    async updateInternalStatus(orderId, internalStatus, notes) {
        const order = await this.getById(orderId);
        const currentIndex = INTERNAL_STATUS_FLOW.indexOf(order.internalStatus);
        const newIndex = INTERNAL_STATUS_FLOW.indexOf(internalStatus);
        if (newIndex < currentIndex && internalStatus !== 'CANCELLED_INTERNAL') {
            throw new errors_1.BadRequestError('لا يمكن الرجوع لحالة سابقة');
        }
        await order_repository_1.orderRepository.updateInternalStatus(orderId, internalStatus, notes);
        return order_repository_1.orderRepository.findById(orderId);
    }
    async cancel(orderId, cancelledBy, reason) {
        const order = await this.getById(orderId);
        if (!['PENDING', 'APPROVED'].includes(order.status)) {
            throw new errors_1.BadRequestError('لا يمكن إلغاء الطلب في هذه الحالة');
        }
        await order_repository_1.orderRepository.updateStatus(orderId, 'CANCELLED', cancelledBy, reason);
        return order_repository_1.orderRepository.findById(orderId);
    }
    async delete(orderId, userId) {
        const order = await this.getById(orderId);
        if (order.userId !== userId) {
            throw new errors_1.ForbiddenError('لا يمكنك حذف طلب آخر');
        }
        if (order.status !== 'PENDING') {
            throw new errors_1.BadRequestError('لا يمكن حذف طلب تم معالجته');
        }
        await order_repository_1.orderRepository.delete(orderId);
        return { message: 'تم حذف الطلب بنجاح' };
    }
    async getQuoteRequests(filters, pagination) {
        return order_repository_1.orderRepository.findQuoteRequests(filters, pagination);
    }
    async getQuoteById(id) {
        const quote = await order_repository_1.orderRepository.findQuoteById(id);
        if (!quote) {
            throw new errors_1.NotFoundError('طلب عرض السعر غير موجود');
        }
        return quote;
    }
    async createQuoteRequest(userId, userName, companyName, input) {
        return order_repository_1.orderRepository.createQuoteRequest({
            userId,
            userName,
            companyName,
            priceType: input.priceType,
            items: input.items
        });
    }
    async processQuote(quoteId) {
        const quote = await this.getQuoteById(quoteId);
        for (const item of quote.items) {
            const product = await order_repository_1.orderRepository.findProductByPartNumber(item.partNumber);
            if (product) {
                await order_repository_1.orderRepository.updateQuoteItem(item.id, {
                    product: { connect: { id: product.id } },
                    matchedPrice: product.priceWholesale,
                    status: 'MATCHED'
                });
            }
            else {
                await order_repository_1.orderRepository.updateQuoteItem(item.id, {
                    status: 'NOT_FOUND'
                });
            }
        }
        await order_repository_1.orderRepository.updateQuoteStatus(quoteId, 'COMPLETED');
        return order_repository_1.orderRepository.findQuoteById(quoteId);
    }
    async updateQuoteStatus(quoteId, status) {
        await this.getQuoteById(quoteId);
        await order_repository_1.orderRepository.updateQuoteStatus(quoteId, status);
        return order_repository_1.orderRepository.findQuoteById(quoteId);
    }
    async searchProducts(search, limit = 20) {
        return order_repository_1.orderRepository.findProducts(search, limit);
    }
    async getOrderStats(userId) {
        const filters = userId ? { userId } : {};
        const allOrders = await order_repository_1.orderRepository.findMany(filters, { page: 1, limit: 1000 });
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
            stats[order.status.toLowerCase()]++;
            stats.totalAmount += order.totalAmount;
        });
        return stats;
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map