import React, { useState } from 'react';
import Calendar from '../components/Calendar';
import DailyForm from '../components/DailyForm';
import Layout from '../components/Layout';

const HomePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFormUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar 
            selectedDate={selectedDate} 
            onSelectDate={handleDateSelect} 
            key={`calendar-${refreshKey}`}
          />
        </div>
        <div className="md:col-span-2">
          <DailyForm 
            date={selectedDate} 
            onUpdate={handleFormUpdate}
          />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;