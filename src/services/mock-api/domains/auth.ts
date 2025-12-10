import { STORAGE_KEYS } from '../core/storage-keys';
import { DEFAULT_SETTINGS, DEMO_ORDERS, DEMO_QUOTES } from '../core/defaults';
import { delay, generateClientId } from '../core/helpers/utils';
import { internalRecordActivity, logActivity } from '../core/helpers/activity';
import { User, BusinessProfile, AdminUser, CustomerType, UserAccountStatus } from '../../../types';

type UserWithExtras = User & { isSuperAdmin?: boolean };

const checkAndResetDailySearch = (user: User) => {
    const today = new Date().toISOString().split('T')[0];
    if (user.status === 'SUSPENDED') {
    }
    if (user.lastSearchDate !== today) {
        user.searchUsed = 0;
        user.lastSearchDate = today;
    }
    return user;
};

const updateLocalUser = (updatedUser: User) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || '{}');
        if(session.id === updatedUser.id) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
        }
    }
};

const getDefaultToolConfigs = () => {
    return {};
};

const getDefaultRoles = () => {
    return [
        {
            id: 'role-super-admin',
            name: 'المدير العام',
            description: 'صلاحيات كاملة',
            permissions: [],
            isSystem: true,
            createdAt: new Date().toISOString()
        }
    ];
};

export const authApi = {
    async login(identifier: string, secret: string, type: 'OWNER' | 'STAFF'): Promise<{ user: UserWithExtras; profile: BusinessProfile | null }> {
        await delay(20);
        
        if (identifier === 'admin' && secret === 'admin') {
            logActivity('LOGIN_ADMIN', { user: 'admin' });
            
            if (!localStorage.getItem(STORAGE_KEYS.TOOL_CONFIGS)) {
                localStorage.setItem(STORAGE_KEYS.TOOL_CONFIGS, JSON.stringify(getDefaultToolConfigs()));
            }
            if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
            }
            if (!localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS)) {
                localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(DEMO_QUOTES));
            }
            if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
            }
            
            if (!localStorage.getItem(STORAGE_KEYS.ADMIN_ROLES)) {
                localStorage.setItem(STORAGE_KEYS.ADMIN_ROLES, JSON.stringify(getDefaultRoles()));
            }
            
            if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
                const superAdminRecord: AdminUser = {
                    id: 'super-admin',
                    username: 'admin',
                    email: 'admin@system.com',
                    fullName: 'المدير العام',
                    roleId: 'role-super-admin',
                    isActive: true,
                    isSuperAdmin: true,
                    createdAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([superAdminRecord]));
            }
            
            internalRecordActivity({
                userId: 'super-admin',
                userName: 'المدير العام',
                role: 'SUPER_ADMIN',
                eventType: 'LOGIN',
                description: 'تسجيل دخول الأدمن',
            });

            const superAdminUser: UserWithExtras = {
                id: 'super-admin',
                clientId: 'admin',
                name: 'المدير العام',
                email: 'admin@system.com',
                role: 'SUPER_ADMIN',
                extendedRole: 'SUPER_ADMIN',
                searchLimit: 0,
                searchUsed: 0,
                isSuperAdmin: true,
                isApproved: true,
                status: 'ACTIVE'
            };
            
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(superAdminUser));

            return {
                user: superAdminUser,
                profile: null
            };
        }

        let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        let profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');

        const demoStaffExists = users.find((u: User) => u.phone === '0500056988' && u.role === 'CUSTOMER_STAFF');
        if (!demoStaffExists) {
            const demoStaffUser: User = {
                id: 'demo-staff-id',
                clientId: 'STAFF-001',
                name: 'موظف تجريبي',
                email: 'staff@sinicar.com',
                phone: '0500056988',
                activationCode: '381960',
                role: 'CUSTOMER_STAFF',
                parentId: 'demo-user-id',
                businessId: 'demo-user-id',
                searchLimit: 20,
                searchUsed: 0,
                status: 'ACTIVE',
                isApproved: true,
                accountStatus: 'ACTIVE' as UserAccountStatus
            };
            users.push(demoStaffUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        const demoSupplier5Exists = users.find((u: User) => u.clientId === 'user-5');
        if (!demoSupplier5Exists) {
            const demoSupplier5User: User = {
                id: 'supplier-user-5',
                clientId: 'user-5',
                name: 'شركة الأمل للتوريد',
                email: '5@sinicar.com',
                phone: '050000005',
                password: '5',
                role: 'CUSTOMER_OWNER',
                searchLimit: 100,
                searchUsed: 0,
                status: 'ACTIVE',
                isApproved: true,
                accountStatus: 'ACTIVE' as UserAccountStatus,
                isSupplier: true,
                extendedRole: 'SUPPLIER_LOCAL'
            };
            users.push(demoSupplier5User);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        const demoSupplierExists = users.find((u: User) => u.clientId === 'SL-20001');
        if (!demoSupplierExists) {
            const demoSupplierUser: User = {
                id: 'supplier-1',
                clientId: 'SL-20001',
                name: 'شركة الأمل للتوريد',
                email: 'supplier1@alamal.com',
                phone: '0560000001',
                password: 'supplier123',
                role: 'CUSTOMER_OWNER',
                searchLimit: 100,
                searchUsed: 0,
                status: 'ACTIVE',
                isApproved: true,
                accountStatus: 'ACTIVE' as UserAccountStatus,
                isSupplier: true,
                extendedRole: 'SUPPLIER_LOCAL'
            };
            users.push(demoSupplierUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
        
        const demoMarketerExists = users.find((u: User) => u.clientId === 'MKT-001');
        if (!demoMarketerExists) {
            const demoMarketerUser: User = {
                id: 'marketer-demo-1',
                clientId: 'MKT-001',
                name: 'محمد المسوق',
                email: 'marketer@sinicar.com',
                phone: '0555555551',
                password: 'marketer123',
                role: 'CUSTOMER_OWNER',
                searchLimit: 75,
                searchUsed: 0,
                status: 'ACTIVE',
                isApproved: true,
                accountStatus: 'ACTIVE' as UserAccountStatus,
                extendedRole: 'MARKETER'
            };
            users.push(demoMarketerUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
        
        const demoAdvertiserExists = users.find((u: User) => u.clientId === 'ADV-001');
        if (!demoAdvertiserExists) {
            const demoAdvertiserUser: User = {
                id: 'advertiser-demo-1',
                clientId: 'ADV-001',
                name: 'أحمد المعلن',
                email: 'advertiser@sinicar.com',
                phone: '0555555552',
                password: 'advertiser123',
                role: 'CUSTOMER_OWNER',
                searchLimit: 60,
                searchUsed: 0,
                status: 'ACTIVE',
                isApproved: true,
                accountStatus: 'ACTIVE' as UserAccountStatus,
                extendedRole: 'EMPLOYEE'
            };
            users.push(demoAdvertiserUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        if (identifier === '1' && secret === '1' && type === 'OWNER') {
            const demoUserExists = users.find((u: User) => u.clientId === '1');
            if (!demoUserExists) {
                const demoId = 'demo-user-id';
                const demoUser: User = {
                    id: demoId, clientId: '1', password: '1', name: 'مدير النظام (تجريبي)',
                    email: 'admin@sinicar.com', role: 'CUSTOMER_OWNER',
                    searchLimit: 50,
                    searchUsed: 0,
                    lastSearchDate: new Date().toISOString().split('T')[0],
                    priceLevel: 'A',
                    isApproved: true,
                    accountStatus: 'ACTIVE' as UserAccountStatus,
                    customerType: 'WHOLESALE',
                    businessId: demoId,
                    hasUnreadOrders: false,
                    status: 'ACTIVE',
                    lastLoginAt: new Date().toISOString()
                };
                const demoProfile: BusinessProfile = {
                    userId: demoId, companyName: 'مركز صيني كار التجريبي', phone: '0500000000',
                    region: 'الوسطى', city: 'الرياض', crNumber: '1010101010', taxNumber: '300055566600003',
                    nationalAddress: '1234 طريق الملك فهد', customerType: CustomerType.SPARE_PARTS_SHOP,
                    deviceFingerprint: 'DEMO', branches: [{id:'b1', name:'الرئيسي', city:'الرياض', address:'صناعية الدائري', phone: '0500000000'}], isApproved: true,
                    status: 'ACTIVE',
                    searchPointsTotal: 50,
                    searchPointsRemaining: 50
                };
                users.push(demoUser);
                profiles.push(demoProfile);
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
                localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
                
                if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
                    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEMO_ORDERS));
                }
                if (!localStorage.getItem(STORAGE_KEYS.QUOTE_REQUESTS)) {
                    localStorage.setItem(STORAGE_KEYS.QUOTE_REQUESTS, JSON.stringify(DEMO_QUOTES));
                }
            }
        }
        
        let user: User | undefined;

        if (type === 'OWNER') {
            user = users.find((u: User) => u.clientId === identifier);
            if (!user) throw new Error('رقم العميل غير صحيح');
            if (user.role === 'ADMIN' as any) user.role = 'CUSTOMER_OWNER';
            
            if (user.password !== secret) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                updateLocalUser(user);
                internalRecordActivity({
                    userId: user.id,
                    userName: user.name,
                    role: user.role,
                    eventType: 'FAILED_LOGIN',
                    description: 'محاولة دخول بكلمة مرور خاطئة'
                });
                throw new Error('كلمة المرور غير صحيحة');
            }
            if (user.role !== 'CUSTOMER_OWNER' && user.role !== 'SUPER_ADMIN') throw new Error('هذا الحساب ليس حساب مالك منشأة');

        } else if (type === 'STAFF') {
            user = users.find((u: User) => u.phone === identifier && (u.role === 'CUSTOMER_STAFF' || u.role === 'EMPLOYEE' as any));
            if (!user) throw new Error('رقم الجوال غير مسجل كموظف');
            
            if (user.role === 'EMPLOYEE' as any) user.role = 'CUSTOMER_STAFF';

            if (user.activationCode !== secret && user.password !== secret) {
                 user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                 updateLocalUser(user);
                 throw new Error('كود الدخول غير صحيح');
            }
        }

        if (!user) throw new Error('فشل تسجيل الدخول');

        if (user.isActive === false || user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
            throw new Error('هذا الحساب موقوف، يرجى مراجعة المسؤول');
        }

        if (user.searchLimit === undefined) {
            user.searchLimit = 50;
            user.searchUsed = 0;
            user.lastSearchDate = new Date().toISOString().split('T')[0];
            user.priceLevel = 'B';
            user.accountStatus = 'ACTIVE' as UserAccountStatus;
        }

        user.failedLoginAttempts = 0;
        user.lastLoginAt = new Date().toISOString();

        user = checkAndResetDailySearch(user);
        updateLocalUser(user);

        const profileLookupId = user.role === 'CUSTOMER_STAFF' ? user.parentId : user.id;
        const profile = profiles.find((p: BusinessProfile) => p.userId === profileLookupId);

        if (profile && type === 'OWNER') {
            profile.lastLoginAt = user.lastLoginAt;
            const pIndex = profiles.findIndex((p: BusinessProfile) => p.userId === profile.userId);
            if (pIndex !== -1) {
                profiles[pIndex] = profile;
                localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
            }
        }

        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
        logActivity('LOGIN_SUCCESS', { userId: user.id, type });

        internalRecordActivity({
            userId: user.id,
            userName: user.name,
            role: user.role,
            eventType: 'LOGIN',
            description: 'تسجيل دخول ناجح',
        });

        return { user, profile: profile || null };
    },

    async registerBusiness(userData: Omit<User, 'id' | 'clientId'>, profileData: Omit<BusinessProfile, 'userId' | 'branches' | 'isApproved'>): Promise<{ success: boolean; message: string; clientId: string }> {
        await delay(100);
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        if (users.find((u: User) => u.email === userData.email)) throw new Error('البريد الإلكتروني مسجل مسبقاً');

        const newUserId = crypto.randomUUID();
        const newClientId = generateClientId();
        const newUser: User = { 
            ...userData, 
            id: newUserId, 
            clientId: newClientId,
            role: 'CUSTOMER_OWNER',
            businessId: newUserId,
            searchLimit: 50,
            searchUsed: 0,
            lastSearchDate: new Date().toISOString().split('T')[0],
            priceLevel: 'C',
            accountStatus: 'PENDING',
            isApproved: false,
            hasUnreadOrders: false,
            status: 'PENDING'
        };
        const newProfile: BusinessProfile = {
          ...profileData, userId: newUserId, branches: [{ id: crypto.randomUUID(), name: 'الفرع الرئيسي', city: profileData.city, address: profileData.nationalAddress, phone: userData.phone as string }], isApproved: false
        };

        users.push(newUser);
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
        profiles.push(newProfile);

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

        return { success: true, message: 'تم إنشاء الحساب', clientId: newClientId };
    },

    async getCurrentSession(): Promise<User | null> {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (!sessionStr) return null;
        
        const sessionUser = JSON.parse(sessionStr);
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        let freshUser = users.find((u:User) => u.id === sessionUser.id);
        
        if (freshUser) {
            if (freshUser.searchLimit === undefined) {
                freshUser.searchLimit = 50;
                freshUser.searchUsed = 0;
                freshUser.lastSearchDate = new Date().toISOString().split('T')[0];
            }

            freshUser = checkAndResetDailySearch(freshUser);
            updateLocalUser(freshUser);

            return freshUser; 
        }
        return sessionUser;
    },

    async logout() { 
        const userStr = localStorage.getItem(STORAGE_KEYS.SESSION);
        if(userStr) {
            const u = JSON.parse(userStr);
            logActivity('LOGOUT', { userId: u.id });
            internalRecordActivity({
               userId: u.id,
               userName: u.name,
               role: u.role,
               eventType: 'LOGOUT',
               description: 'تسجيل خروج'
            });
        }
        localStorage.removeItem(STORAGE_KEYS.SESSION); 
    }
};
