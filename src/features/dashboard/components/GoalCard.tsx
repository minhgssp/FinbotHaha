
import React from 'react';
import { FinancialGoal, GoalType } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface GoalCardProps {
    goal: FinancialGoal;
    monthlySpending: number;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, monthlySpending }) => {
    
    const renderGoal = () => {
        switch (goal.type) {
            case GoalType.MONTHLY_SAVINGS:
                return (
                    <>
                        <p className="text-lg text-slate-200 font-semibold">{goal.description}</p>
                        <p className="text-3xl text-green-400 font-bold mt-2">{formatCurrency(goal.targetAmount)} / tháng</p>
                        <p className="text-sm text-slate-400 mt-1">Mục tiêu tiết kiệm hàng tháng</p>
                    </>
                );
            case GoalType.MONTHLY_BUDGET:
                const budgetProgress = goal.targetAmount > 0 ? (monthlySpending / goal.targetAmount) * 100 : 0;
                const remainingAmount = goal.targetAmount - monthlySpending;
                 return (
                    <>
                        <p className="text-lg text-slate-200 font-semibold">{goal.description}</p>
                        <p className="text-sm text-slate-400 mt-1 mb-2">Ngân sách chi tiêu hàng tháng</p>
                        
                        <div className="w-full bg-slate-600 rounded-full h-4 my-2">
                            <div 
                                className={`h-4 rounded-full ${budgetProgress > 100 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                             <p className="text-xl text-yellow-400 font-bold">{formatCurrency(monthlySpending)}</p>
                             <p className="text-base text-slate-400">/ {formatCurrency(goal.targetAmount)}</p>
                        </div>
                        <p className={`text-sm mt-2 font-semibold ${remainingAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {remainingAmount >= 0 
                                ? `Còn lại: ${formatCurrency(remainingAmount)}`
                                : `Vượt ngân sách: ${formatCurrency(Math.abs(remainingAmount))}`
                            }
                        </p>
                    </>
                );
            case GoalType.ACCUMULATE:
                const progress = goal.targetAmount > 0 ? ((goal.currentAmount ?? 0) / goal.targetAmount) * 100 : 0;
                return (
                    <>
                        <p className="text-lg text-slate-200 font-semibold">{goal.description}</p>
                        <div className="w-full bg-slate-600 rounded-full h-2.5 my-3">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between items-end">
                             <p className="text-2xl text-blue-400 font-bold">{formatCurrency(goal.targetAmount)}</p>
                             <p className="text-sm text-slate-400">Đã có: {formatCurrency(goal.currentAmount ?? 0)}</p>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">Mục tiêu tích lũy</p>
                    </>
                );
            default:
                return <p>Chưa có mục tiêu</p>;
        }
    }
    return (
        <div className="bg-slate-700 p-6 rounded-lg">
            {renderGoal()}
        </div>
    )
}

export default GoalCard;