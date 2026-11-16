import React from 'react';
import { Calendar } from 'lucide-react';

const DateFilter = ({ selectedDate, onDateChange, onTodayClick }) => {
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-surface-border shadow-subtle text-xs">
      <Calendar className="w-3.5 h-3.5 text-content-secondary shrink-0" />
      <span className="text-content-secondary font-medium hidden sm:inline">Date:</span>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="bg-transparent font-medium text-content-main focus:outline-none cursor-pointer text-xs"
      />
      <button
        type="button"
        onClick={onTodayClick}
        className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${
          isToday()
            ? 'bg-forest-600 text-white'
            : 'bg-surface-bg text-content-secondary hover:text-content-main hover:bg-surface-border'
        }`}
      >
        Today
      </button>
    </div>
  );
};

export default DateFilter;
