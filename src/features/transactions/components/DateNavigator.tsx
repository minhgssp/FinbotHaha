

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '../../../components/IconComponents.tsx';
import { formatDateForDisplay } from '../../../utils/formatters.ts';

interface DateNavigatorProps {
    currentDate: string;
    setCurrentDate: (date: string) => void;
    transactionsCount: number;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, setCurrentDate, transactionsCount }) => {

  const changeDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  return (
    <div className="flex justify-between items-center bg-slate-900 p-3 border-b border-slate-800 flex-shrink-0">
      <button 
        onClick={() => changeDay(-1)} 
        className="p-1 text-slate-400 hover:text-green-500 rounded-full transition duration-150"
        aria-label="Ngày trước"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>
      
      <div className="flex items-center text-center">
        <CalendarIcon className="w-5 h-5 mr-2 text-green-500" />
        <span className="text-base font-semibold text-white">{formatDateForDisplay(currentDate)}</span>
        <span className="text-xs text-slate-400 ml-2">({transactionsCount} GD)</span>
      </div>

      <button 
        onClick={() => changeDay(1)} 
        className="p-1 text-slate-400 hover:text-green-500 rounded-full transition duration-150"
        aria-label="Ngày sau"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DateNavigator;