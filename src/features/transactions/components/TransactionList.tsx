
import React from 'react';
import { Transaction } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-slate-500 py-10">
        <p>Chưa có giao dịch nào.</p>
        <p className="text-sm">Hãy bắt đầu bằng cách thêm một khoản chi tiêu ở trên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Giao dịch gần đây</h3>
      {transactions.map((t) => (
        <div key={t.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
          <div>
            <p className="text-slate-200 font-medium">{t.description}</p>
            <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
          </div>
          <p className={`font-semibold text-lg ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
            {t.type === 'expense' ? '-' : '+'} {formatCurrency(t.amount)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;