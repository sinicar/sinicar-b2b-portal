export { STORAGE_KEYS } from './core/storage-keys';
export { 
  DEFAULT_UI_TEXTS,
  DEFAULT_SETTINGS, 
  INITIAL_PRODUCTS, 
  INITIAL_BANNERS, 
  INITIAL_NEWS,
  DEMO_ORDERS,
  DEMO_QUOTES 
} from './core/defaults';
export { delay, generateClientId, generateActivationCode, generateId } from './core/helpers/utils';
export { internalRecordActivity, logActivity } from './core/helpers/activity';
export { 
  internalCreateNotification, 
  createEventNotification, 
  getAdminUserIds,
  type CreateNotificationParams 
} from './core/helpers/notifications';

export { systemApi } from './domains/system';
export { authApi } from './domains/auth';
export { settingsApi } from './domains/settings';
export { notificationsApi } from './domains/notifications';

export { MockApi } from '../mockApi';
