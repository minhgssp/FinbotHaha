
import React, { useState } from 'react';
import { RecurringTransaction } from '../../../types.ts';
import { PlusCircleIcon, ArrowPathIcon } from '../../../components/IconComponents.tsx';
import RecurringTransactionItem from './components/RecurringTransactionItem.tsx';
import RecurringTransactionForm from './components/RecurringTransactionForm.tsx';

interface RecurringTransactionsScreenProps {
    items: RecurringTransaction[];
    onAdd: (item: Omit<RecurringTransaction, 'id'>) => void;
    onUpdate: (item: RecurringTransaction) => void;
    onDelete: (id: string) => void;
}

const RecurringTransactionsScreen: React.FC<RecurringTransactionsScreenProps> = ({ items, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);

    const handleOpenAddModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: RecurringTransaction) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">Giao dịch Định kỳ</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Thêm mới
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.map(item => (
                            <RecurringTransactionItem
                                key={item.id}
                                item={item}
                                onEdit={() => handleOpenEditModal(item)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                        <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                        <h3 className="text-lg font-semibold text-white">Chưa có giao dịch định kỳ</h3>
                        <p className="mt-1">
                            Thêm các khoản thu chi lặp lại như lương, tiền nhà... để tự động hóa việc ghi chép.
                        </p>
                        <button onClick={handleOpenAddModal} className="mt-4 text-green-400 font-semibold hover:underline">
                            Thêm giao dịch đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <RecurringTransactionForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={editingItem ? onUpdate : onAdd}
                    onDelete={onDelete}
                    existingItem={editingItem}
                />
            )}
        </div>
    );
};

export default RecurringTransactionsScreen;