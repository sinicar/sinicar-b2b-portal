/**
 * PermissionTabs - Tab navigation for Permission Center
 * التبويبات الرئيسية لمركز الصلاحيات
 */

import React from 'react';
import { TabType, TabConfig } from '../types';

interface PermissionTabsProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  translate?: (key: string, fallback: string) => string;
}

export const PermissionTabs: React.FC<PermissionTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  translate
}) => {
  const getLabel = (tab: TabConfig) => {
    if (translate) {
      return translate(tab.labelKey, tab.labelAr);
    }
    return tab.labelAr;
  };

  return (
    <div className="border-b border-slate-200 overflow-x-auto">
      <div className="flex min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#0B1B3A] border-b-2 border-[#C8A04F] bg-slate-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            data-testid={`tab-${tab.id}`}
          >
            {tab.icon}
            {getLabel(tab)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PermissionTabs;
