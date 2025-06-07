import React from 'react';
import WeightChart from '../components/WeightChart';
import Layout from '../components/Layout';

const StatsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <WeightChart />
      </div>
    </Layout>
  );
};

export default StatsPage;