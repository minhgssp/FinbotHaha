
import React from 'react';
import { Asset, Liability, AssetType, LiabilityType } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';
import { BanknotesIcon, BuildingOfficeIcon, CreditCardIcon, ScaleIcon } from '../../../components/IconComponents.tsx';

interface AssetLiabilityItemProps {
    item: Asset | Liability;
    type: 'asset' | 'liability';
    onEdit: () => void;
}

const AssetLiabilityItem: React.FC<AssetLiabilityItemProps> = ({ item, type, onEdit }) => {
    const isAsset = type === 'asset';
    const data = item as Asset | Liability;

    const getIcon = () => {
        const itemType = data.type;
        switch(itemType) {
            case AssetType.CASH: return <BanknotesIcon className="w-6 h-6 text-green-400" />;
            case AssetType.INVESTMENT: return <ScaleIcon className="w-6 h-6 text-blue-400" />;
            case AssetType.REAL_ESTATE: return <BuildingOfficeIcon className="w-6 h-6 text-yellow-400" />;
            case LiabilityType.LOAN: return <ScaleIcon className="w-6 h-6 text-red-400" />;
            case LiabilityType.CREDIT_CARD: return <CreditCardIcon className="w-6 h-6 text-orange-400" />;
            default: return <BanknotesIcon className="w-6 h-6 text-slate-500" />;
        }
    };
    
    const calculateCurrentValue = () => {
        if (isAsset) {
            return (data as Asset).value;
        } else {
            const liability = data as Liability;
            const totalPaid = liability.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
            return liability.initialAmount - totalPaid;
        }
    };

    const currentValue = calculateCurrentValue();
    const assetData = isAsset ? (data as Asset) : null;

    return (
        <button 
            onClick={onEdit}
            className="w-full flex items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
        >
            <div className="flex-shrink-0 mr-4">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 truncate">{data.name}</p>
                {assetData && assetData.quantity && assetData.unit ? (
                     <p className="text-xs text-slate-400">{assetData.quantity.toLocaleString('vi-VN')} {assetData.unit}</p>
                ) : (
                    <p className="text-xs text-slate-400">{data.type}</p>
                )}
            </div>
            <div className="ml-4 flex-shrink-0">
                <p className={`font-bold text-lg ${isAsset ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(currentValue)}
                </p>
            </div>
        </button>
    );
};

export default AssetLiabilityItem;