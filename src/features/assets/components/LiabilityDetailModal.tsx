import React, { useState, useMemo } from 'react';
import { Liability, Payment } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface LiabilityDetailModalProps {
    liability: Liability;
    onClose: () => void;
    onSave: (liability: Liability) => void;
}

const LiabilityDetailModal: React.FC<LiabilityDetailModalProps> = ({ liability, onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    
    const totalPaid = useMemo(() => {
        return liability.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    }, [liability.paymentHistory]);

    const remainingAmount = liability.initialAmount - totalPaid;
    const progress = liability.initialAmount > 0 ? (totalPaid / liability.initialAmount) * 100 : 0;

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        const newPayment: Payment = {
            id: `payment-${Date.now()}`,
            date: new Date().toISOString(),
            amount: numAmount,
            note: note.trim()
        };

        const updatedLiability: Liability = {
            ...liability,
            paymentHistory: [...liability.paymentHistory, newPayment],
        };
        
        onSave(updatedLiability);
        setAmount('');
        setNote('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">{liability.name}</h2>
                    <p className="text-slate-400 mb-2">{liability.type} {liability.lender && `- ${liability.lender}`}</p>
                    
                    <div className="my-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-medium text-slate-300">Đã trả</span>
                            <span className="text-sm font-medium text-slate-300">Còn lại</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                         <div className="flex justify-between items-end mt-1">
                            <span className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</span>
                            <span className="text-lg font-bold text-red-400">{formatCurrency(remainingAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Lịch sử thanh toán</h3>
                    <div className="space-y-2">
                         {liability.paymentHistory.length > 0 ? liability.paymentHistory.map(p => (
                            <div key={p.id} className="bg-slate-700/80 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-white">{p.note || 'Thanh toán'}</p>
                                    <p className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <p className="text-sm font-semibold text-green-400">{formatCurrency(p.amount)}</p>
                            </div>
                        )).reverse() : <p className="text-slate-500 text-center py-4">Chưa có thanh toán nào.</p>}
                    </div>
                </div>
                
                <div className="flex-shrink-0 border-t border-slate-700 pt-4">
                     <h3 className="text-lg font-semibold mb-2 text-slate-300">Ghi nhận thanh toán mới</h3>
                     <form onSubmit={handleAddPayment} className="grid grid-cols-3 gap-3">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Số tiền" className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" required />
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú (tùy chọn)" className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent" />
                        <button type="submit" className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">Thêm</button>
                    </form>
                    <button onClick={onClose} className="mt-4 w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default LiabilityDetailModal;
