
import React from 'react';
import { IncomeSource, AmountType } from '../../../../types.ts';
import { formatCurrency } from '../../../utils/formatters.ts';

interface IncomeCardProps {
    source: IncomeSource;
}

const IncomeCard: React.FC<IncomeCardProps> = ({ source }) => {
  const renderAmount = () => {
    switch (source.amountType) {
      case AmountType.FIXED:
        return <span className="text-green-400">{formatCurrency(source.amount ?? 0)}</span>;
      case AmountType.ESTIMATED:
        return <span className="text-yellow-400">~ {formatCurrency(source.amount ?? 0)}</span>;
      case AmountType.RANGE:
        return <span className="text-blue-400">{formatCurrency(source.minAmount ?? 0)} - {formatCurrency(source.maxAmount ?? 0)}</span>;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
      <p className="text-slate-300">{source.source}</p>
      <p className="font-semibold text-lg">{renderAmount()}</p>
    </div>
  );
};

export default IncomeCard;