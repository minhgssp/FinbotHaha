

import React from 'react';
import { PendingTransaction } from '../../../../types.ts';
import { formatCurrency, formatDateForDisplay } from '../../../utils/formatters.ts';
import { ArrowPathIcon } from '../../../components/IconComponents.tsx';

interface TransactionConfirmationCardProps {
  message: string;
  transaction: PendingTransaction;
  onUndo: () => void;
}

const TransactionConfirmationCard: React.FC<TransactionConfirmationCardProps> = ({
  message,
  transaction,
  onUndo,
}) => {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const borderColor = isIncome ? 'border-green-600/50' : 'border-red-600/50';
  const sign = isIncome ? '+' : '-';

  return (
    <div className="flex justify-start">
        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl rounded-bl-none bg-slate-700 text-slate-200`}>
            {/* AI's confirmation text */}
            <p className="text-base mb-4">{message}</p>
            
            {/* Transaction details card */}
            <div className={`bg-slate-800/50 p-3 rounded-lg border ${borderColor}`}>
                {transaction.frequency === 'monthly' && (
                    <div className="flex items-center text-xs font-semibold text-yellow-300 mb-2 border-b border-slate-700 pb-2">
                        <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                        <span>Giao dịch Hàng tháng</span>
                    </div>
                )}
                
                {/* Row 1: Content, Category, Date */}
                <div className="grid grid-cols-3 gap-x-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Nội dung</p>
                        <p className="text-sm font-semibold text-slate-100 truncate mt-1">{transaction.description}</p>
                    </div>
                     <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Danh mục</p>
                        <p className="text-sm font-semibold text-slate-100 truncate mt-1">{transaction.category}</p>
                    </div>
                     <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Ngày</p>
                        <p className="text-sm font-semibold text-slate-100 mt-1">{formatDateForDisplay(transaction.date)}</p>
                    </div>
                </div>

                <div className="my-3 border-t border-slate-700"></div>

                {/* Row 2: Amount & Undo Button */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Số tiền</p>
                        <p className={`text-2xl font-bold ${amountColor}`}>{sign} {formatCurrency(transaction.amount)}</p>
                    </div>
                    <button 
                        onClick={onUndo}
                        className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TransactionConfirmationCard;