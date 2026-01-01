/**
 * PromptCard - Card displaying a system prompt
 * كارت البرومبت - متطابق مع inline JSX في AdminAITrainingPage
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { SystemPrompt } from '../types';

interface PromptCardProps {
  prompt: SystemPrompt;
  isRTL?: boolean;
  onEdit: (prompt: SystemPrompt) => void;
  onDelete: (id: string) => void;
}

const getTypeLabel = (type: SystemPrompt['type'], isRTL: boolean) => {
  switch (type) {
    case 'system': return isRTL ? 'نظام' : 'System';
    case 'persona': return isRTL ? 'شخصية' : 'Persona';
    case 'context': return isRTL ? 'سياق' : 'Context';
    case 'instruction': return isRTL ? 'تعليمات' : 'Instruction';
    default: return type;
  }
};

const getTypeColor = (type: SystemPrompt['type']) => {
  switch (type) {
    case 'system': return 'bg-blue-100 text-blue-700';
    case 'persona': return 'bg-purple-100 text-purple-700';
    case 'context': return 'bg-green-100 text-green-700';
    case 'instruction': return 'bg-orange-100 text-orange-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  isRTL = false,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      className={`border rounded-xl p-5 transition-all ${prompt.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
      data-testid={`prompt-${prompt.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(prompt.type)}`}>
              {getTypeLabel(prompt.type, isRTL)}
            </span>
            <span className="text-xs text-slate-400">#{prompt.order}</span>
            {!prompt.enabled && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                {isRTL ? 'معطّل' : 'Disabled'}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">
            {isRTL ? prompt.nameAr || prompt.name : prompt.name}
          </h3>
          <p className="text-sm text-slate-500 mb-3">{prompt.description}</p>
          <pre className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">
            {isRTL ? prompt.contentAr || prompt.content : prompt.content}
          </pre>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(prompt)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            data-testid={`button-edit-prompt-${prompt.id}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid={`button-delete-prompt-${prompt.id}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
