import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type WeightData = {
  date: string;
  weight: number;
};

const WeightChart: React.FC = () => {
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchWeightData = async () => {
      setLoading(true);

      let startDate;
      const now = new Date();

      switch (period) {
        case '1m':
          startDate = subMonths(now, 1);
          break;
        case '3m':
          startDate = subMonths(now, 3);
          break;
        case '6m':
          startDate = subMonths(now, 6);
          break;
        case '1y':
          startDate = subMonths(now, 12);
          break;
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_entries')
        .select('date, weight')
        .eq('user_id', user.id)
        .gte('date', formattedStartDate)
        .not('weight', 'is', null)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching weight data:', error);
      } else {
        setWeightData(data as WeightData[] || []);
      }

      setLoading(false);
    };

    fetchWeightData();
  }, [period, user]);

  const chartData = {
    labels: weightData.map((entry) => 
      format(new Date(entry.date), 'dd MMM', { locale: fr })
    ),
    datasets: [
      {
        label: 'Poids (kg)',
        data: weightData.map((entry) => entry.weight),
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(13, 148, 136, 0.5)',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution du poids',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Poids (kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Suivi du poids</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('1m')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '1m'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 mois
          </button>
          <button
            onClick={() => setPeriod('3m')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '3m'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 mois
          </button>
          <button
            onClick={() => setPeriod('6m')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '6m'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            6 mois
          </button>
          <button
            onClick={() => setPeriod('1y')}
            className={`px-3 py-1 text-sm rounded-md ${
              period === '1y'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 an
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : weightData.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500">
          <p>Aucune donnée de poids disponible pour cette période</p>
          <p className="text-sm mt-2">Ajoutez votre poids quotidien pour voir l'évolution</p>
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default WeightChart;