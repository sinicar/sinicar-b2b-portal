/**
 * KnowledgeEntryCard - Card displaying a knowledge base entry
 * كارت قاعدة المعرفة - متطابق مع inline JSX في AdminAITrainingPage
 */

import React from 'react';
import { Edit2, Trash2, Star, BarChart3 } from 'lucide-react';
import { KnowledgeEntry, CategoryOption } from '../types';

interface KnowledgeEntryCardProps {
  entry: KnowledgeEntry;
  isRTL?: boolean;
  categories: CategoryOption[];
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'products': return 'bg-blue-100 text-blue-700';
    case 'orders': return 'bg-green-100 text-green-700';
    case 'shipping': return 'bg-orange-100 text-orange-700';
    case 'returns': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const KnowledgeEntryCard: React.FC<KnowledgeEntryCardProps> = ({
  entry,
  isRTL = false,
  categories,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      className={`border rounded-xl p-5 transition-all ${entry.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
      data-testid={`knowledge-entry-${entry.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
              {categories.find(c => c.value === entry.category)?.[isRTL ? 'labelAr' : 'labelEn']}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Star size={12} className="text-yellow-500" />
              {entry.priority}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <BarChart3 size={12} />
              {entry.usageCount} {isRTL ? 'استخدام' : 'uses'}
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">{entry.question}</h3>
          <p className="text-sm text-slate-600 whitespace-pre-line">{entry.answer}</p>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {entry.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            data-testid={`button-edit-knowledge-${entry.id}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid={`button-delete-knowledge-${entry.id}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeEntryCard;
