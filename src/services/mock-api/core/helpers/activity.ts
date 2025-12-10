import { STORAGE_KEYS } from '../storage-keys';
import { ActivityLogEntry, User, ActivityEventType } from '../../../../types';

export const internalRecordActivity = (input: Omit<ActivityLogEntry, 'id' | 'createdAt'>) => {
    try {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
        
        let userName = input.userName;
        let role = input.role;

        if (!userName || !role) {
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            const user = users.find((u: User) => u.id === input.userId);
            if (user) {
                if(!userName) userName = user.name;
                if(!role) role = user.role;
            } else if (input.userId === 'super-admin') {
                userName = 'المدير العام';
                role = 'SUPER_ADMIN';
            }
        }

        const newEntry: ActivityLogEntry = {
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date().toISOString(),
            userId: input.userId,
            userName,
            role,
            eventType: input.eventType,
            description: input.description,
            page: input.page,
            metadata: input.metadata
        };

        logs.unshift(newEntry);
        
        if (logs.length > 1000) {
            logs.length = 1000;
        }

        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to record activity", e);
    }
};

export const logActivity = (type: string, data: any) => {
    try {
        const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
        logs.push({ type, data, timestamp: new Date().toISOString() });
        if(logs.length > 100) logs.shift();
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to log activity", e);
    }
};
