
import React from 'react';
import { TrashIcon } from '../../../components/IconComponents.tsx';
import { Transaction } from '../../../../types.ts';

interface TransactionItemProps {
    transaction: Transaction & { time: string };
    onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const sign = isIncome ? '+' : '-';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace(/\s*₫$/, ''); // Remove currency symbol and any space before it
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click nổi bọt lên phần tử cha
    onDelete(transaction.id);
  }
  
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded-xl shadow-md mb-2 hover:bg-slate-700 transition duration-150 active:bg-slate-700/80">
      
      <div className="flex items-center min-w-0 flex-1">
        <div className="text-xs font-medium text-slate-400 w-10 flex-shrink-0">{transaction.time}</div>
        <p className="text-sm font-medium text-slate-100 ml-2 truncate">
          {transaction.description} 
          <span className="text-xs text-slate-500 ml-1">({transaction.category})</span>
        </p>
      </div>

      <div className="text-right flex items-center flex-shrink-0 ml-2">
        <p className={`text-sm font-bold ${amountColor} flex-shrink-0`}>
          {sign}{formatAmount(transaction.amount)}₫
        </p>
         <button 
            onClick={handleDelete}
            className="p-2 ml-2 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
            aria-label="Xóa giao dịch"
         >
            <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;