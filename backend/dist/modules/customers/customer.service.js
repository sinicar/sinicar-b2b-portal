"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerService = exports.CustomerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const customer_repository_1 = require("./customer.repository");
const errors_1 = require("../../utils/errors");
class CustomerService {
    async list(filters, pagination) {
        return customer_repository_1.customerRepository.findMany(filters, pagination);
    }
    async getById(id) {
        const customer = await customer_repository_1.customerRepository.findById(id);
        if (!customer) {
            throw new errors_1.NotFoundError('العميل غير موجود');
        }
        return customer;
    }
    async getByClientId(clientId) {
        const customer = await customer_repository_1.customerRepository.findByClientId(clientId);
        if (!customer) {
            throw new errors_1.NotFoundError('العميل غير موجود');
        }
        return customer;
    }
    async create(input) {
        const existing = await customer_repository_1.customerRepository.findByClientId(input.clientId);
        if (existing) {
            throw new errors_1.ConflictError('معرف العميل مستخدم بالفعل');
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
        const customer = await customer_repository_1.customerRepository.create({
            clientId: input.clientId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: input.role,
            status: 'PENDING',
            profile: {
                create: {
                    companyName: input.profile.companyName,
                    phone: input.profile.phone,
                    region: input.profile.region,
                    city: input.profile.city,
                    crNumber: input.profile.crNumber,
                    taxNumber: input.profile.taxNumber,
                    nationalAddress: input.profile.nationalAddress,
                    customerType: input.profile.customerType,
                    businessCustomerType: input.profile.businessCustomerType,
                    isApproved: false
                }
            }
        });
        return customer;
    }
    async update(id, input) {
        await this.getById(id);
        const { profile, ...userData } = input;
        const customer = await customer_repository_1.customerRepository.update(id, userData);
        if (profile) {
            await customer_repository_1.customerRepository.updateProfile(id, profile);
        }
        return customer_repository_1.customerRepository.findById(id);
    }
    async delete(id) {
        await this.getById(id);
        await customer_repository_1.customerRepository.delete(id);
        return { message: 'تم حذف العميل بنجاح' };
    }
    async softDelete(id) {
        await this.getById(id);
        await customer_repository_1.customerRepository.softDelete(id);
        return { message: 'تم تعطيل حساب العميل' };
    }
    async approve(id, priceLevel, searchPoints) {
        const customer = await this.getById(id);
        if (!customer.profile) {
            throw new errors_1.BadRequestError('العميل ليس لديه ملف تجاري');
        }
        await customer_repository_1.customerRepository.update(id, { status: 'ACTIVE' });
        await customer_repository_1.customerRepository.updateProfile(id, {
            isApproved: true,
            ...(priceLevel && { assignedPriceLevel: priceLevel }),
            ...(searchPoints && {
                searchPointsTotal: searchPoints,
                searchPointsRemaining: searchPoints
            })
        });
        return customer_repository_1.customerRepository.findById(id);
    }
    async suspend(id, until, reason) {
        await this.getById(id);
        await customer_repository_1.customerRepository.update(id, { status: 'SUSPENDED' });
        await customer_repository_1.customerRepository.updateProfile(id, {
            suspendedUntil: until,
            internalNotes: reason
        });
        return customer_repository_1.customerRepository.findById(id);
    }
    async activate(id) {
        await this.getById(id);
        await customer_repository_1.customerRepository.update(id, {
            status: 'ACTIVE',
            isActive: true
        });
        await customer_repository_1.customerRepository.updateProfile(id, { suspendedUntil: null });
        return customer_repository_1.customerRepository.findById(id);
    }
    async addBranch(customerId, data) {
        const customer = await this.getById(customerId);
        if (!customer.profile) {
            throw new errors_1.BadRequestError('العميل ليس لديه ملف تجاري');
        }
        return customer_repository_1.customerRepository.addBranch(customer.profile.id, data);
    }
    async updateBranch(branchId, data) {
        return customer_repository_1.customerRepository.updateBranch(branchId, data);
    }
    async deleteBranch(branchId) {
        await customer_repository_1.customerRepository.deleteBranch(branchId);
        return { message: 'تم حذف الفرع بنجاح' };
    }
    async getStaff(customerId) {
        await this.getById(customerId);
        return customer_repository_1.customerRepository.getStaff(customerId);
    }
    async addStaff(customerId, data) {
        const customer = await this.getById(customerId);
        const activationCode = (0, uuid_1.v4)().split('-')[0].toUpperCase();
        const hashedPassword = data.password ? await bcryptjs_1.default.hash(data.password, 10) : undefined;
        const staff = await customer_repository_1.customerRepository.addStaff({
            clientId: `${customer.clientId}-${activationCode}`,
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: hashedPassword,
            role: 'CUSTOMER_STAFF',
            employeeRole: data.employeeRole,
            parent: { connect: { id: customerId } },
            activationCode,
            businessId: customer.businessId
        });
        return {
            ...staff,
            activationCode
        };
    }
    async updateStaff(staffId, data) {
        return customer_repository_1.customerRepository.update(staffId, data);
    }
    async deleteStaff(staffId) {
        await customer_repository_1.customerRepository.delete(staffId);
        return { message: 'تم حذف الموظف بنجاح' };
    }
    async updateSearchPoints(customerId, points, operation) {
        const customer = await this.getById(customerId);
        if (!customer.profile) {
            throw new errors_1.BadRequestError('العميل ليس لديه ملف تجاري');
        }
        let newRemaining = customer.profile.searchPointsRemaining;
        let newTotal = customer.profile.searchPointsTotal;
        switch (operation) {
            case 'add':
                newTotal += points;
                newRemaining += points;
                break;
            case 'set':
                newTotal = points;
                newRemaining = points;
                break;
            case 'use':
                if (newRemaining < points) {
                    throw new errors_1.BadRequestError('لا توجد نقاط بحث كافية');
                }
                newRemaining -= points;
                break;
        }
        await customer_repository_1.customerRepository.updateProfile(customerId, {
            searchPointsTotal: newTotal,
            searchPointsRemaining: newRemaining
        });
        return customer_repository_1.customerRepository.findById(customerId);
    }
    async getAccountOpeningRequests(pagination) {
        return customer_repository_1.customerRepository.getAccountOpeningRequests(pagination);
    }
    async createAccountOpeningRequest(data) {
        return customer_repository_1.customerRepository.createAccountOpeningRequest(data);
    }
    async reviewAccountOpeningRequest(id, decision, reviewedBy, notes) {
        const status = decision === 'approve' ? 'APPROVED' : 'REJECTED';
        return customer_repository_1.customerRepository.updateAccountOpeningRequest(id, {
            status,
            reviewedBy,
            reviewedAt: new Date(),
            adminNotes: notes
        });
    }
}
exports.CustomerService = CustomerService;
exports.customerService = new CustomerService();
//# sourceMappingURL=customer.service.js.map