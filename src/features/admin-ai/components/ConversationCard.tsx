/**
 * ConversationCard - Card displaying a training conversation
 * كارت المحادثة التدريبية - متطابق مع inline JSX في AdminAITrainingPage
 */

import React from 'react';
import { Edit2, Trash2, Bot, User, Star } from 'lucide-react';
import { TrainingConversation, CategoryOption } from '../types';

interface ConversationCardProps {
  conversation: TrainingConversation;
  isRTL?: boolean;
  categories: CategoryOption[];
  onEdit: (conversation: TrainingConversation) => void;
  onDelete: (id: string) => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isRTL = false,
  categories,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      className="border border-slate-200 rounded-xl p-5 bg-white"
      data-testid={`conversation-${conversation.id}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-800">{conversation.title}</h3>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
            {categories.find(c => c.value === conversation.category)?.[isRTL ? 'labelAr' : 'labelEn']}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < conversation.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(conversation)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            data-testid={`button-edit-conversation-${conversation.id}`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(conversation.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            data-testid={`button-delete-conversation-${conversation.id}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {conversation.messages.map((msg, i) => (
          <div 
            key={i}
            className={`flex gap-3 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            {msg.role === 'assistant' && (
              <div className="p-2 bg-purple-100 rounded-full h-fit">
                <Bot size={16} className="text-purple-600" />
              </div>
            )}
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'assistant'
                ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                : 'bg-purple-600 text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="p-2 bg-slate-200 rounded-full h-fit">
                <User size={16} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationCard;
