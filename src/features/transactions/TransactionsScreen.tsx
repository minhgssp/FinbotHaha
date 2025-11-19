

import React, { useState, useMemo } from 'react';
import { CalendarIcon } from '../../../components/IconComponents.tsx';
import DateNavigator from './components/DateNavigator.tsx';
import SummaryCard from './components/SummaryCard.tsx';
import TransactionItem from './components/TransactionItem.tsx';
import { Transaction } from '../../../types.ts';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ 
  transactions, 
  onDeleteTransaction
}) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentDate));
  }, [transactions, currentDate]);

  const formatTransactionTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900 relative">
        <DateNavigator 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate}
          transactionsCount={dailyTransactions.length}
        />
        
        <SummaryCard transactions={dailyTransactions} />

        <div className="flex-1 overflow-y-auto p-4 pt-0 custom-scrollbar">
          <h3 className="text-lg font-semibold mb-3 text-slate-300">Danh sách Giao dịch</h3>
          {dailyTransactions.length > 0 ? (
            <div className="space-y-2">
              {dailyTransactions.map(t => (
                <TransactionItem 
                    key={t.id} 
                    transaction={{
                        ...t,
                        time: formatTransactionTime(t.date)
                    }}
                    onDelete={onDeleteTransaction} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-700 rounded-lg">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p>Không có giao dịch nào vào ngày này.</p>
              <p className="text-sm mt-1 text-green-500">Chuyển sang tab 'Trợ lý AI' để thêm giao dịch mới!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TransactionsScreen;