import React, { useState, useEffect } from 'react';
import { RecurringTransaction } from '../../../../types.ts';
import { TRANSACTION_CATEGORIES } from '../../../../constants.ts';

interface RecurringTransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: RecurringTransaction | Omit<RecurringTransaction, 'id'>) => void;
    onDelete: (id: string) => void;
    existingItem: RecurringTransaction | null;
}

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({ isOpen, onClose, onSave, onDelete, existingItem }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState(TRANSACTION_CATEGORIES[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    
    useEffect(() => {
        if (existingItem) {
            setDescription(existingItem.description);
            setAmount(String(existingItem.amount));
            setType(existingItem.type);
            setCategory(existingItem.category);
            setStartDate(existingItem.startDate);
        } else {
            // Reset form for new item
            setDescription('');
            setAmount('');
            setType('expense');
            setCategory(TRANSACTION_CATEGORIES[0]);
            setStartDate(new Date().toISOString().split('T')[0]);
        }
    }, [existingItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
            
            const itemData = {
                description,
                amount: numericAmount,
                type,
                category,
                frequency: 'monthly' as const,
                startDate,
                nextDueDate: startDate, // Initially, next due date is the start date
            };

            if (existingItem) {
                onSave({ ...existingItem, ...itemData });
            } else {
                onSave(itemData);
            }
            onClose();
        }
    };
    
    const handleDelete = () => {
        if (existingItem && window.confirm(`Bạn có chắc muốn xóa "${existingItem.description}"?`)) {
            onDelete(existingItem.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-white">{existingItem ? 'Chỉnh sửa' : 'Thêm'} Giao dịch Định kỳ</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent focus:border-transparent" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Số tiền</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent focus:border-transparent" required />
                        </div>
                        <div>
                             <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Loại</label>
                             <select id="type" value={type} onChange={e => setType(e.target.value as 'income' | 'expense')} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent focus:border-transparent">
                                <option value="expense">Chi tiêu</option>
                                <option value="income">Thu nhập</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">Danh mục</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent focus:border-transparent">
                            {TRANSACTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-1">Ngày bắt đầu hàng tháng</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent focus:border-transparent" required />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        {existingItem && (
                             <button type="button" onClick={handleDelete} className="text-red-500 hover:underline">Xóa</button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button type="button" onClick={onClose} className="py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Hủy</button>
                            <button type="submit" className="py-2 px-6 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTransactionForm;
