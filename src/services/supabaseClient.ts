/**
 * Supabase Client
 * عميل Supabase للتعامل مع قاعدة البيانات
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.config';

// إنشاء عميل Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase API Service
 * خدمة API باستخدام Supabase
 */
export const SupabaseService = {
    /**
     * Authentication - تسجيل الدخول
     */
    auth: {
        async login(customerNumber: string, password: string) {
            // البحث عن المستخدم برقم العميل وكلمة المرور
            const { data, error } = await supabase
                .from('users')
                .select('*, business_profiles(*)')
                .eq('customer_number', customerNumber)
                .eq('password_hash', password)
                .eq('is_active', true)
                .single();


            if (error || !data) {
                throw new Error('بيانات الدخول غير صحيحة');
            }

            // حفظ الجلسة في localStorage
            localStorage.setItem('sini_car_user', JSON.stringify(data));

            return data;
        },

        async logout() {
            localStorage.removeItem('sini_car_user');
        },

        getCurrentUser() {
            const userStr = localStorage.getItem('sini_car_user');
            return userStr ? JSON.parse(userStr) : null;
        },
    },

    /**
     * Products - المنتجات
     */
    products: {
        async search(query: string) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`part_number.ilike.%${query}%,name.ilike.%${query}%`)
                .eq('is_active', true)
                .limit(50);

            if (error) throw error;
            return data || [];
        },

        async getAll() {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;
            return data || [];
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        async create(product: any) {
            const { data, error } = await supabase
                .from('products')
                .insert(product)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async update(id: string, updates: any) {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    },

    /**
     * Orders - الطلبات
     */
    orders: {
        async getAll() {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*), users(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        async getByUser(userId: string) {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        async create(order: any) {
            // إنشاء رقم الطلب
            const orderNumber = `ORD-${Date.now()}`;

            // إنشاء الطلب
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    user_id: order.userId,
                    status: 'PENDING',
                    total_amount: order.totalAmount,
                    notes: order.notes,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // إضافة عناصر الطلب
            if (order.items && order.items.length > 0) {
                const orderItems = order.items.map((item: any) => ({
                    order_id: orderData.id,
                    product_id: item.productId,
                    part_number: item.partNumber,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.quantity * item.price,
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;
            }

            return orderData;
        },

        async updateStatus(orderId: string, status: string) {
            const { data, error } = await supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    },

    /**
     * Users - المستخدمين
     */
    users: {
        async getAll() {
            const { data, error } = await supabase
                .from('users')
                .select('*, business_profiles(*)');

            if (error) throw error;
            return data || [];
        },

        async getById(id: string) {
            const { data, error } = await supabase
                .from('users')
                .select('*, business_profiles(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },

        async create(user: any) {
            const { data, error } = await supabase
                .from('users')
                .insert(user)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    },

    /**
     * Notifications - الإشعارات
     */
    notifications: {
        async getByUser(userId: string) {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },

        async markAsRead(notificationId: string) {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async create(notification: any) {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notification)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    },
};

export default SupabaseService;
