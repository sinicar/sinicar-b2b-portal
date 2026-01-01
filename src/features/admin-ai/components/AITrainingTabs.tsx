/**
 * AITrainingTabs - Tab navigation for AI Training page
 * تبويبات صفحة تدريب الذكاء الاصطناعي
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TabType } from '../types';

interface TabConfig {
  id: TabType;
  icon: LucideIcon;
  label: string;
}

interface AITrainingTabsProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const AITrainingTabs: React.FC<AITrainingTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
      <div className="flex flex-wrap gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AITrainingTabs;
