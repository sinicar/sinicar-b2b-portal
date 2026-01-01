/**
 * TestCaseCard - Card displaying a test case
 * كارت حالة الاختبار - متطابق مع inline JSX في AdminAITrainingPage
 */

import React from 'react';
import { Trash2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { TestCase, CategoryOption } from '../types';

interface TestCaseCardProps {
  testCase: TestCase;
  isRTL?: boolean;
  categories: CategoryOption[];
  onDelete: (id: string) => void;
}

export const TestCaseCard: React.FC<TestCaseCardProps> = ({
  testCase,
  isRTL = false,
  categories,
  onDelete
}) => {
  return (
    <div 
      className={`border rounded-xl p-4 ${
        testCase.passed === undefined ? 'border-slate-200 bg-white' :
        testCase.passed ? 'border-green-200 bg-green-50' :
        'border-red-200 bg-red-50'
      }`}
      data-testid={`test-case-${testCase.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {testCase.passed === undefined ? (
              <HelpCircle size={18} className="text-slate-400" />
            ) : testCase.passed ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <XCircle size={18} className="text-red-600" />
            )}
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
              {categories.find(c => c.value === testCase.category)?.[isRTL ? 'labelAr' : 'labelEn']}
            </span>
            {testCase.score !== undefined && (
              <span className={`text-xs font-medium ${testCase.score >= 80 ? 'text-green-600' : testCase.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {testCase.score}%
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 mb-1">{isRTL ? 'الإدخال:' : 'Input:'} {testCase.input}</p>
          <p className="text-sm text-slate-600 mb-1">{isRTL ? 'المتوقع:' : 'Expected:'} {testCase.expectedOutput}</p>
          {testCase.actualOutput && (
            <p className="text-sm text-slate-500">{isRTL ? 'الفعلي:' : 'Actual:'} {testCase.actualOutput}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(testCase.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          data-testid={`button-delete-test-${testCase.id}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TestCaseCard;
