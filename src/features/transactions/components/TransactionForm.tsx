import React, { useState } from 'react';
import { Transaction } from '../../../../types.ts';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddTransaction({
        description: description.trim(),
        amount: numericAmount,
        type: 'expense', // Currently defaults to expense
        // FIX: Add missing 'category' property with a default value.
        category: 'Khác',
      });
      setDescription('');
      setAmount('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả (ví dụ: Ăn trưa)"
        className="flex-1 bg-slate-700 text-slate-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Số tiền"
        className="w-full sm:w-40 bg-slate-700 text-slate-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white rounded-lg py-2 px-6 font-semibold hover:bg-green-500 transition-colors duration-200 disabled:bg-slate-600"
      >
        Thêm chi tiêu
      </button>
    </form>
  );
};

export default TransactionForm;