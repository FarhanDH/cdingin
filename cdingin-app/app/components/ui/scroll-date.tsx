// src/components/CalendarInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  getDaysInMonth,
  getYear,
  getMonth,
  getDate,
  setYear,
  setMonth,
  setDate,
} from 'date-fns';

interface CalendarInputProps {
  initialDate?: Date;
  onChange: (date: Date) => void;
}

const CalendarInput: React.FC<CalendarInputProps> = ({
  initialDate = new Date(),
  onChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  const scrollToItem = (
    ref: React.RefObject<HTMLDivElement>,
    index: number,
  ) => {
    if (ref.current) {
      const itemHeight = ref.current.scrollHeight / ref.current.children.length;
      ref.current.scrollTop =
        index * itemHeight - (ref.current.clientHeight / 2 - itemHeight / 2);
    }
  };

  useEffect(() => {
    const currentYearIndex = getYear(selectedDate) - 1900;
    const currentMonthIndex = getMonth(selectedDate);
    const currentDayIndex = getDate(selectedDate) - 1;

    scrollToItem(yearRef, currentYearIndex);
    scrollToItem(monthRef, currentMonthIndex);
    scrollToItem(dayRef, currentDayIndex);

    onChange(selectedDate);
  }, [selectedDate, onChange]);

  const handleYearChange = (year: number) => {
    setSelectedDate(setYear(selectedDate, year));
  };

  const handleMonthChange = (month: number) => {
    setSelectedDate(setMonth(selectedDate, month));
  };

  const handleDayChange = (day: number) => {
    setSelectedDate(setDate(selectedDate, day));
  };

  const years = Array.from({ length: 200 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) =>
    format(setMonth(new Date(), i), 'MMMM'),
  );
  const daysInMonth = getDaysInMonth(selectedDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative flex justify-center items-center w-80 h-64 bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
      {/* Garis Pemilih (Selection Line) */}
      <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-y-2 border-blue-500/50 pointer-events-none z-10 rounded-md bg-blue-100/30 backdrop-blur-sm transition-all"></div>

      {/* Kolom Scroll */}
      <div className="absolute inset-0 flex">
        {/* Kolom Tahun */}
        <div
          ref={yearRef}
          className="flex-1 h-full overflow-y-scroll text-center scrollbar-hide py-8"
        >
          {years.map((year) => (
            <div
              key={year}
              onClick={() => handleYearChange(year)}
              className={`py-1 text-lg font-medium cursor-pointer transition-all duration-200 ${
                getYear(selectedDate) === year
                  ? 'text-blue-700 font-bold transform scale-110'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {year}
            </div>
          ))}
        </div>

        {/* Kolom Bulan */}
        <div
          ref={monthRef}
          className="flex-1 h-full overflow-y-scroll text-center scrollbar-hide py-8"
        >
          {months.map((month, index) => (
            <div
              key={month}
              onClick={() => handleMonthChange(index)}
              className={`py-1 text-lg font-medium cursor-pointer transition-all duration-200 ${
                getMonth(selectedDate) === index
                  ? 'text-blue-700 font-bold transform scale-110'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {month}
            </div>
          ))}
        </div>

        {/* Kolom Hari */}
        <div
          ref={dayRef}
          className="flex-1 h-full overflow-y-scroll text-center scrollbar-hide py-8"
        >
          {days.map((day) => (
            <div
              key={day}
              onClick={() => handleDayChange(day)}
              className={`py-1 text-lg font-medium cursor-pointer transition-all duration-200 ${
                getDate(selectedDate) === day
                  ? 'text-blue-700 font-bold transform scale-110'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarInput;
