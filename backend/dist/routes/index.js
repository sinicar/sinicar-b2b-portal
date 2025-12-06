"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const organization_routes_1 = __importDefault(require("../modules/organizations/organization.routes"));
const customer_routes_1 = __importDefault(require("../modules/customers/customer.routes"));
const order_routes_1 = __importDefault(require("../modules/orders/order.routes"));
const installment_routes_1 = __importDefault(require("../modules/installments/installment.routes"));
const supplier_routes_1 = __importDefault(require("../modules/suppliers/supplier.routes"));
const ad_routes_1 = __importDefault(require("../modules/ads/ad.routes"));
const tool_routes_1 = __importDefault(require("../modules/tools/tool.routes"));
const ai_routes_1 = __importDefault(require("../modules/ai/ai.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const currency_routes_1 = __importDefault(require("../modules/currency/currency.routes"));
const pricing_routes_1 = __importDefault(require("../modules/pricing/pricing.routes"));
const permission_routes_1 = __importDefault(require("../modules/permissions/permission.routes"));
const settings_routes_1 = __importDefault(require("../modules/settings/settings.routes"));
const messaging_routes_1 = __importDefault(require("../modules/messaging/messaging.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/organizations', organization_routes_1.default);
router.use('/customers', customer_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/installments', installment_routes_1.default);
router.use('/suppliers', supplier_routes_1.default);
router.use('/ads', ad_routes_1.default);
router.use('/trader-tools', tool_routes_1.default);
router.use('/ai', ai_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/currencies', currency_routes_1.default);
router.use('/pricing', pricing_routes_1.default);
router.use('/permissions', permission_routes_1.default);
router.use('/settings', settings_routes_1.default);
router.use('/messaging', messaging_routes_1.default);
router.get('/', (req, res) => {
    res.json({
        message: 'SINI CAR B2B API',
        version: 'v1',
        endpoints: [
            '/auth',
            '/organizations',
            '/customers',
            '/orders',
            '/installments',
            '/suppliers',
            '/ads',
            '/trader-tools',
            '/ai',
            '/admin',
            '/currencies',
            '/pricing',
            '/permissions',
            '/settings',
            '/messaging'
        ]
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map