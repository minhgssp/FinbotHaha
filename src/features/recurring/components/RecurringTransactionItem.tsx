
import React from 'react';
import { RecurringTransaction } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';
import { ArrowPathIcon } from '../../../components/IconComponents.tsx';

interface RecurringTransactionItemProps {
    item: RecurringTransaction;
    onEdit: () => void;
}

const RecurringTransactionItem: React.FC<RecurringTransactionItemProps> = ({ item, onEdit }) => {
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
    
    const formatDate = (dateString: string) => {
        // Use T00:00:00 to ensure the date is parsed in the local timezone and not shifted by UTC conversion.
        return new Date(dateString + 'T00:00:00').toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <button
            onClick={onEdit}
            className="w-full flex justify-between items-center p-4 bg-slate-800 rounded-xl shadow-md hover:bg-slate-700 transition-colors duration-150 text-left"
        >
            <div className="flex items-center min-w-0 flex-1">
                <div className="flex-shrink-0 mr-4">
                    <ArrowPathIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{item.description}</p>
                    <p className="text-sm text-slate-400">
                        Hàng tháng, tiếp theo vào {formatDate(item.nextDueDate)}
                    </p>
                </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
                <p className={`text-lg font-bold ${amountColor}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                </p>
                <p className="text-xs text-slate-500">{item.category}</p>
            </div>
        </button>
    );
};

export default RecurringTransactionItem;