
import React from 'react';
import { FinancialGoal, GoalType } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';
import { SparklesIcon, PlusCircleIcon } from '../../../components/IconComponents.tsx';

interface ActionableInsightCardProps {
    netIncome: number;
    financialGoal: FinancialGoal | null;
}

const ActionableInsightCard: React.FC<ActionableInsightCardProps> = ({ netIncome, financialGoal }) => {
    // Chỉ hiển thị thẻ này nếu có dòng tiền dương và có mục tiêu để hướng tới
    if (netIncome <= 0 || !financialGoal) {
        return null;
    }

    // Heuristic đơn giản: gợi ý tiết kiệm 30% dòng tiền cho mục tiêu tích lũy
    // Trong tương lai, logic này có thể được thay thế bằng một lệnh gọi đến Gemini API
    const suggestedSavings = netIncome * 0.3;

    return (
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-dashed border-green-500/50">
            <div className="flex items-start mb-3">
                <SparklesIcon className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                <h3 className="text-xl font-bold text-white">Gợi ý cho bạn</h3>
            </div>
            
            <p className="text-slate-300 mb-4">
                Tháng này bạn đang có dòng tiền rất tốt! Dựa trên mục tiêu <span className="font-semibold text-green-300">"{financialGoal.description}"</span>, 
                bạn có thể cân nhắc tích lũy thêm <span className="font-bold text-white">{formatCurrency(suggestedSavings)}</span> để nhanh chóng đạt được kế hoạch.
            </p>

            <button
                // onClick={() => { /* Logic để thêm giao dịch tích lũy sẽ được thêm sau */ }}
                className="w-full flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-600"
            >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Tích lũy ngay {formatCurrency(suggestedSavings)}
            </button>
        </div>
    );
};

export default ActionableInsightCard;