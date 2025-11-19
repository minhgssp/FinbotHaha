

import React, { useMemo } from 'react';
import { IncomeSource, FinancialGoal, AmountType, Transaction, TodoItem } from '../../../types.ts';
import IncomeCard from './components/IncomeCard.tsx';
import GoalCard from './components/GoalCard.tsx';
import ActionableInsightCard from './components/ActionableInsightCard.tsx';
import TodoList from '../onboarding/components/TodoList.tsx';
import { formatCurrency } from '../../utils/formatters.ts';

interface DashboardScreenProps {
  incomeSources: IncomeSource[];
  financialGoal: FinancialGoal | null;
  transactions: Transaction[];
  todos: TodoItem[];
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ incomeSources, financialGoal, transactions, todos }) => {
  
  const hasIncompleteTodos = useMemo(() => todos.some(t => !t.completed), [todos]);

  if (incomeSources.length === 0 && !financialGoal) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Bảng điều khiển</h2>
          <p className="text-slate-400">
            Dữ liệu tài chính của bạn sẽ được hiển thị ở đây.
          </p>
          <p className="text-slate-400 mt-2">
            Vui lòng hoàn thành cuộc trò chuyện với Trợ lý AI để thiết lập thông tin.
          </p>
        </div>
      </div>
    );
  }

  const totalMonthlyIncome = useMemo(() => {
    return incomeSources.reduce((total, source) => {
      switch (source.amountType) {
        case AmountType.FIXED:
        case AmountType.ESTIMATED:
          return total + (source.amount ?? 0);
        case AmountType.RANGE:
          return total + (source.minAmount ?? 0);
        default:
          return total;
      }
    }, 0);
  }, [incomeSources]);

  const totalMonthlySpending = useMemo(() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return transactions
          .filter(t => {
              const transactionDate = new Date(t.date);
              return t.type === 'expense' && transactionDate >= startOfMonth && transactionDate <= endOfMonth;
          })
          .reduce((total, t) => total + t.amount, 0);
  }, [transactions]);

  const netIncome = totalMonthlyIncome - totalMonthlySpending;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-6">
      {/* Onboarding Todo List (only if not completed) */}
      {hasIncompleteTodos && (
        <div className="mb-6">
          <TodoList items={todos} />
        </div>
      )}

      {/* Unified Overview & Income Details Section */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Tổng quan Tháng này</h2>
        {/* Summary Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Tổng Thu Nhập</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMonthlyIncome)}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Tổng Chi Tiêu</p>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(totalMonthlySpending)}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-sm text-slate-400">Dòng tiền</p>
            <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(netIncome)}
            </p>
          </div>
        </div>
        
        {/* Income Details */}
        <div className="space-y-3 mb-4">
            {incomeSources.map((source, index) => (
              <IncomeCard key={index} source={source} />
            ))}
        </div>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-300 font-semibold">Tổng thu nhập tối thiểu</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMonthlyIncome)}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đây là con số an toàn nhất để lập kế hoạch tài chính.</p>
        </div>
      </div>
      
      {/* Actionable Insight Card */}
       <ActionableInsightCard 
          netIncome={netIncome}
          financialGoal={financialGoal}
        />

      {/* Goal Section */}
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
         <h3 className="text-xl font-bold text-white mb-4">Mục Tiêu Tài Chính</h3>
         {financialGoal ? (
          <GoalCard 
            goal={financialGoal} 
            monthlySpending={totalMonthlySpending} 
          />
         ) : (
          <p className="text-slate-400">Chưa có mục tiêu nào được thiết lập.</p>
         )}
      </div>
    </div>
  );
};

export default DashboardScreen;
