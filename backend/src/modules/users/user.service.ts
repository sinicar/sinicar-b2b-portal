import { userRepository, UserFilters } from './user.repository';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';

export class UserService {
  async list(filters: UserFilters, pagination: PaginationParams) {
    return userRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('المستخدم غير موجود');
    }
    return user;
  }

  async getByClientId(clientId: string) {
    const user = await userRepository.findByClientId(clientId);
    if (!user) {
      throw new NotFoundError('المستخدم غير موجود');
    }
    return user;
  }

  async create(data: any) {
    // Check if clientId exists
    const existing = await userRepository.findByClientId(data.clientId);
    if (existing) {
      throw new BadRequestError('رقم العميل موجود مسبقاً');
    }
    return userRepository.create(data);
  }

  async update(id: string, data: any) {
    await this.getById(id); // Verify exists
    return userRepository.update(id, data);
  }

  async updateStatus(id: string, status: string) {
    await this.getById(id); // Verify exists
    const validStatuses = await userRepository.getStatuses();
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('حالة غير صالحة');
    }
    return userRepository.updateStatus(id, status);
  }

  async delete(id: string) {
    await this.getById(id); // Verify exists
    return userRepository.delete(id);
  }

  async getRoles() {
    return userRepository.getRoles();
  }

  async getStatuses() {
    return userRepository.getStatuses();
  }

  async getStats() {
    return userRepository.getStats();
  }
}

export const userService = new UserService();
