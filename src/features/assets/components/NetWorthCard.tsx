
import React from 'react';
import { formatCurrency } from '../../../utils/formatters.ts';

interface NetWorthCardProps {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ netWorth, totalAssets, totalLiabilities }) => {
    return (
        <div className="bg-gradient-to-br from-green-800 to-slate-800 p-6 rounded-xl shadow-lg border border-green-700/50">
            <p className="text-sm font-medium text-green-300">Giá trị tài sản ròng</p>
            <p className={`text-4xl font-bold mt-1 ${netWorth >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatCurrency(netWorth)}
            </p>
            <div className="mt-4 pt-4 border-t border-green-700/30 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-green-200">Tổng tài sản</p>
                    <p className="font-semibold text-white">{formatCurrency(totalAssets)}</p>
                </div>
                <div>
                    <p className="text-xs text-red-300">Tổng nợ</p>
                    <p className="font-semibold text-white">{formatCurrency(totalLiabilities)}</p>
                </div>
            </div>
        </div>
    );
};

export default NetWorthCard;
