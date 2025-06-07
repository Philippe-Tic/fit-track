import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { supabase, DailyEntry } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type CalendarProps = {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
};

const Calendar: React.FC<CalendarProps> = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      setLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [currentMonth, user]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const hasEntryForDay = (day: Date) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return entries.some(entry => entry.date === formattedDay);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() - 1 }).map((_, i) => (
          <div key={`empty-start-${i}`} className="h-10 sm:h-14 p-1" />
        ))}

        {daysInMonth.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const hasEntry = hasEntryForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toString()}
              className={`relative h-10 sm:h-14 p-1 ${
                !isCurrentMonth ? 'text-gray-300' : ''
              }`}
            >
              <button
                onClick={() => onSelectDate(day)}
                className={`w-full h-full flex flex-col items-center justify-center rounded-full transition-colors ${
                  isSelected
                    ? 'bg-teal-500 text-white'
                    : isCurrentDay
                    ? 'bg-teal-100 text-teal-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-sm sm:text-base">
                  {format(day, 'd')}
                </span>
                {hasEntry && (
                  <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 ${
                    isSelected ? 'text-white' : 'text-teal-500'
                  }`}>
                    <Activity size={12} />
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {Array.from({ length: 7 - new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDay() }).map((_, i) => (
          <div key={`empty-end-${i}`} className="h-10 sm:h-14 p-1" />
        ))}
      </div>
    </div>
  );
};

export default Calendar;