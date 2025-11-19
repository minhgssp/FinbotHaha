





import React, { useState, useMemo } from 'react';
import { Asset, AssetTransaction } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface AssetDetailModalProps {
    asset: Asset;
    onClose: () => void;
    onPurchase: (cost: number, quantity: number) => void;
    onSell: (proceeds: number, quantity: number) => void;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose, onPurchase, onSell }) => {
    const [txType, setTxType] = useState<'buy' | 'sell'>('buy');
    const [quantity, setQuantity] = useState('');
    const [totalValue, setTotalValue] = useState('');

    const {
        totalBuyValue,
        totalBuyQuantity,
        totalSellValue,
        totalSellQuantity,
        remainingQuantity,
    } = useMemo(() => {
        const transactions = asset.transactions || [];
        
        const buys = transactions.filter(t => t.type === 'buy');
        const sells = transactions.filter(t => t.type === 'sell');

        const totalBuyValue = buys.reduce((sum, t) => sum + t.totalValue, 0);
        const totalBuyQuantity = buys.reduce((sum, t) => sum + t.quantity, 0);

        const totalSellValue = sells.reduce((sum, t) => sum + t.totalValue, 0);
        const totalSellQuantity = sells.reduce((sum, t) => sum + t.quantity, 0);

        const remainingQuantity = totalBuyQuantity - totalSellQuantity;

        return {
            totalBuyValue,
            totalBuyQuantity,
            totalSellValue,
            totalSellQuantity,
            remainingQuantity,
        };
    }, [asset.transactions]);


    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseFloat(quantity);
        const numTotalValue = parseFloat(totalValue);

        if (isNaN(numQuantity) || isNaN(numTotalValue) || numQuantity <= 0 || numTotalValue < 0) return;
        
        if (txType === 'sell' && numQuantity > remainingQuantity) {
            alert(`Số lượng bán không thể lớn hơn số lượng đang nắm giữ (${remainingQuantity}).`);
            return;
        }

        if (txType === 'buy') {
            onPurchase(numTotalValue, numQuantity);
        } else {
            onSell(numTotalValue, numQuantity);
        }
        
        onClose();
    };
    
    // Render for non-trackable assets (e.g., cash, real estate)
    if (!asset.transactions) {
        return (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-xl">
                    <h2 className="text-xl font-bold text-white">{asset.name}</h2>
                    <p className="text-slate-400 mb-4">{asset.type}</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(asset.value)}</p>
                    <p className="text-slate-500 mt-4">Tài sản này không hỗ trợ theo dõi giao dịch chi tiết.</p>
                     <button onClick={onClose} className="mt-6 w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Đóng</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700 shadow-xl flex flex-col max-h-[90vh]">
                {/* Header Info */}
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{asset.name}</h2>
                            <p className="text-slate-400 mb-2">{asset.type}</p>
                        </div>
                         <div className="text-right">
                             <p className="text-sm text-slate-400">Số lượng còn lại</p>
                             <p className="text-xl font-bold text-white">{remainingQuantity.toLocaleString('vi-VN')} {asset.unit}</p>
                         </div>
                    </div>
                    
                    <div className="space-y-3 my-4">
                        {/* Buy Section */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <p className="text-sm font-semibold text-green-400 mb-2">Tổng Mua vào</p>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-300">Vật chất:</p>
                                <p className="text-lg font-bold text-white">{totalBuyQuantity.toLocaleString('vi-VN')} {asset.unit}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-slate-300">Giá trị:</p>
                                <p className="text-lg font-bold text-green-400">{formatCurrency(totalBuyValue)}</p>
                            </div>
                        </div>

                        {/* Sell Section */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                            <p className="text-sm font-semibold text-orange-400 mb-2">Tổng Bán ra</p>
                            <div className="flex justify-between items-center">
                                <p className="text-slate-300">Vật chất:</p>
                                <p className="text-lg font-bold text-white">{totalSellQuantity.toLocaleString('vi-VN')} {asset.unit}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-slate-300">Giá trị:</p>
                                <p className="text-lg font-bold text-orange-400">{formatCurrency(totalSellValue)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Lịch sử giao dịch</h3>
                    <div className="space-y-2">
                        {asset.transactions.length > 0 ? [...asset.transactions].reverse().map(tx => {
                            const isBuy = tx.type === 'buy';
                            return (
                                <div key={tx.id} className="bg-slate-700/80 p-3 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className={`text-sm font-medium ${isBuy ? 'text-green-300' : 'text-orange-300'}`}>
                                            {isBuy ? 'Mua' : 'Bán'} {tx.quantity.toLocaleString('vi-VN')} {asset.unit}
                                        </p>
                                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-semibold ${isBuy ? 'text-green-400' : 'text-orange-400'}`}>
                                            {formatCurrency(tx.totalValue)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            @{formatCurrency(tx.totalValue / tx.quantity)}/{asset.unit}
                                        </p>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-slate-500 text-center py-4">Chưa có giao dịch.</p>}
                    </div>
                </div>
                
                {/* Add Transaction Form */}
                <div className="flex-shrink-0 border-t border-slate-700 pt-4">
                    <div className="flex mb-3 border-b border-slate-700">
                        <button onClick={() => setTxType('buy')} className={`flex-1 pb-2 text-center font-semibold ${txType === 'buy' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400'}`}>Mua vào</button>
                        <button onClick={() => setTxType('sell')} className={`flex-1 pb-2 text-center font-semibold ${txType === 'sell' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-slate-400'}`}>Bán ra</button>
                    </div>
                    <form onSubmit={handleAddTransaction} className="grid grid-cols-3 gap-3">
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder={`Số lượng (${asset.unit})`} className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent col-span-1" required step="any" />
                        <input type="number" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="Tổng giá trị (VND)" className="w-full bg-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 border-transparent col-span-1" required step="any" />
                        <button type="submit" className={`py-2 px-4 rounded-lg font-bold transition-colors col-span-1 ${txType === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'}`}>
                            {txType === 'buy' ? 'Thêm' : 'Ghi nhận'}
                        </button>
                    </form>
                    <button onClick={onClose} className="mt-4 w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors">Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default AssetDetailModal;