
import React from 'react';
import { formatCurrency } from '../../../utils/formatters.ts';

interface SummaryCardProps {
    transactions: { type: 'income' | 'expense', amount: number }[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 text-green-500">Tình hình Thu Chi</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-700/30 p-4 rounded-xl shadow-lg border border-green-600/50">
          <p className="text-sm text-green-300">Tổng Thu</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-700/30 p-4 rounded-xl shadow-lg border border-red-600/50">
          <p className="text-sm text-red-300">Tổng Chi</p>
          <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
