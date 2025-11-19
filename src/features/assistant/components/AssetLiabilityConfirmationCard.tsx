import React from 'react';
import { PendingAssetAction, AssetActionType } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface AssetLiabilityConfirmationCardProps {
  message: string;
  item: PendingAssetAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AssetLiabilityConfirmationCard: React.FC<AssetLiabilityConfirmationCardProps> = ({
  message,
  item,
  onConfirm,
  onCancel,
}) => {
  const renderContent = () => {
    switch(item.action) {
      case AssetActionType.BUY:
      case AssetActionType.SELL:
        const isBuy = item.action === AssetActionType.BUY;
        const titleText = isBuy ? `Mua tài sản: ${item.name}` : `Bán tài sản: ${item.name}`;
        const amountColor = isBuy ? 'text-red-400' : 'text-green-400';
        const borderColor = isBuy ? 'border-red-600/50' : 'border-green-600/50';
        const unitPrice = (item.quantity ?? 0) > 0 ? item.amount / item.quantity! : 0;
        return (
          <div className={`bg-slate-800/50 p-3 rounded-lg border ${borderColor}`}>
             <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{titleText}</p>
             <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                    <p className="text-xs text-slate-400">Tổng giá trị</p>
                    <p className={`font-bold ${amountColor}`}>{formatCurrency(item.amount)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400">Số lượng</p>
                    <p className="font-bold text-white">{`${item.quantity} ${item.unit}`}</p>
                </div>
             </div>
             {unitPrice > 0 && (
                <div className="text-xs text-slate-400 mt-1 text-center border-t border-slate-700 pt-1">
                    Đơn giá: {formatCurrency(unitPrice)}/{item.unit}
                </div>
             )}
          </div>
        );

      case AssetActionType.BORROW:
      case AssetActionType.REPAY:
        const isBorrow = item.action === AssetActionType.BORROW;
        const title = isBorrow ? `Vay nợ: ${item.name}` : `Trả nợ: ${item.name}`;
        const liabilityAmountColor = isBorrow ? 'text-green-400' : 'text-red-400';
        const liabilityBorderColor = isBorrow ? 'border-green-600/50' : 'border-red-600/50';

        return (
          <div className={`bg-slate-800/50 p-3 rounded-lg border ${liabilityBorderColor}`}>
            <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</p>
            {item.lender && <p className="text-xs text-slate-400">Bên cho vay: {item.lender}</p>}
            {item.type && !isBorrow && <p className="text-sm text-slate-400">{item.type}</p>}
            <p className={`text-xl font-bold mt-1 ${liabilityAmountColor}`}>{formatCurrency(item.amount)}</p>
          </div>
        );
      
      case AssetActionType.UPDATE:
         return (
          <div className={`bg-slate-800/50 p-3 rounded-lg border border-yellow-600/50`}>
            <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Cập nhật giá trị: {item.name}</p>
            <p className={`text-xl font-bold mt-1 text-yellow-400`}>{formatCurrency(item.amount)}</p>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="flex justify-start">
        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-4 rounded-2xl rounded-bl-none bg-slate-700 text-slate-200`}>
            <p className="text-base mb-4">{message}</p>
            
            {renderContent()}

            <div className="mt-4 flex gap-3">
                <button 
                    onClick={onConfirm}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Xác nhận
                </button>
                <button 
                    onClick={onCancel}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Hủy
                </button>
            </div>
        </div>
    </div>
  );
};