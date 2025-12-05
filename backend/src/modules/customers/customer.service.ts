import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { customerRepository, CustomerFilters } from './customer.repository';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import { CreateCustomerInput, UpdateCustomerInput } from '../../schemas/customer.schema';

export class CustomerService {
  async list(filters: CustomerFilters, pagination: PaginationParams) {
    return customerRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('العميل غير موجود');
    }
    return customer;
  }

  async getByClientId(clientId: string) {
    const customer = await customerRepository.findByClientId(clientId);
    if (!customer) {
      throw new NotFoundError('العميل غير موجود');
    }
    return customer;
  }

  async create(input: CreateCustomerInput) {
    const existing = await customerRepository.findByClientId(input.clientId);
    if (existing) {
      throw new ConflictError('معرف العميل مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const customer = await customerRepository.create({
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

  async update(id: string, input: UpdateCustomerInput) {
    await this.getById(id);

    const { profile, ...userData } = input;

    const customer = await customerRepository.update(id, userData);

    if (profile) {
      await customerRepository.updateProfile(id, profile);
    }

    return customerRepository.findById(id);
  }

  async delete(id: string) {
    await this.getById(id);
    await customerRepository.delete(id);
    return { message: 'تم حذف العميل بنجاح' };
  }

  async softDelete(id: string) {
    await this.getById(id);
    await customerRepository.softDelete(id);
    return { message: 'تم تعطيل حساب العميل' };
  }

  async approve(id: string, priceLevel?: string, searchPoints?: number) {
    const customer = await this.getById(id);
    
    if (!customer.profile) {
      throw new BadRequestError('العميل ليس لديه ملف تجاري');
    }

    await customerRepository.update(id, { status: 'ACTIVE' });
    await customerRepository.updateProfile(id, {
      isApproved: true,
      ...(priceLevel && { assignedPriceLevel: priceLevel as any }),
      ...(searchPoints && {
        searchPointsTotal: searchPoints,
        searchPointsRemaining: searchPoints
      })
    });

    return customerRepository.findById(id);
  }

  async suspend(id: string, until?: Date, reason?: string) {
    await this.getById(id);

    await customerRepository.update(id, { status: 'SUSPENDED' });
    
    await customerRepository.updateProfile(id, {
      suspendedUntil: until,
      internalNotes: reason
    });

    return customerRepository.findById(id);
  }

  async activate(id: string) {
    await this.getById(id);
    await customerRepository.update(id, {
      status: 'ACTIVE',
      isActive: true
    });
    await customerRepository.updateProfile(id, { suspendedUntil: null });
    return customerRepository.findById(id);
  }

  async addBranch(customerId: string, data: {
    name: string;
    city: string;
    phone: string;
    address?: string;
    managerName?: string;
    managerPhone?: string;
    isMainBranch?: boolean;
  }) {
    const customer = await this.getById(customerId);
    if (!customer.profile) {
      throw new BadRequestError('العميل ليس لديه ملف تجاري');
    }

    return customerRepository.addBranch(customer.profile.id, data);
  }

  async updateBranch(branchId: string, data: {
    name?: string;
    city?: string;
    phone?: string;
    address?: string;
    managerName?: string;
    managerPhone?: string;
  }) {
    return customerRepository.updateBranch(branchId, data);
  }

  async deleteBranch(branchId: string) {
    await customerRepository.deleteBranch(branchId);
    return { message: 'تم حذف الفرع بنجاح' };
  }

  async getStaff(customerId: string) {
    await this.getById(customerId);
    return customerRepository.getStaff(customerId);
  }

  async addStaff(customerId: string, data: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    employeeRole: 'MANAGER' | 'BUYER';
  }) {
    const customer = await this.getById(customerId);

    const activationCode = uuidv4().split('-')[0].toUpperCase();
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const staff = await customerRepository.addStaff({
      clientId: `${customer.clientId}-${activationCode}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      role: 'CUSTOMER_STAFF',
      employeeRole: data.employeeRole,
      parentId: customerId,
      activationCode,
      businessId: customer.businessId
    });

    return {
      ...staff,
      activationCode
    };
  }

  async updateStaff(staffId: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    employeeRole?: 'MANAGER' | 'BUYER';
    isActive?: boolean;
  }) {
    return customerRepository.update(staffId, data);
  }

  async deleteStaff(staffId: string) {
    await customerRepository.delete(staffId);
    return { message: 'تم حذف الموظف بنجاح' };
  }

  async updateSearchPoints(customerId: string, points: number, operation: 'add' | 'set' | 'use') {
    const customer = await this.getById(customerId);
    if (!customer.profile) {
      throw new BadRequestError('العميل ليس لديه ملف تجاري');
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
          throw new BadRequestError('لا توجد نقاط بحث كافية');
        }
        newRemaining -= points;
        break;
    }

    await customerRepository.updateProfile(customerId, {
      searchPointsTotal: newTotal,
      searchPointsRemaining: newRemaining
    });

    return customerRepository.findById(customerId);
  }

  async getAccountOpeningRequests(pagination: PaginationParams) {
    return customerRepository.getAccountOpeningRequests(pagination);
  }

  async createAccountOpeningRequest(data: any) {
    return customerRepository.createAccountOpeningRequest(data);
  }

  async reviewAccountOpeningRequest(id: string, decision: 'approve' | 'reject', reviewedBy: string, notes?: string) {
    const status = decision === 'approve' ? 'APPROVED' : 'REJECTED';
    
    return customerRepository.updateAccountOpeningRequest(id, {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      adminNotes: notes
    });
  }
}

export const customerService = new CustomerService();
