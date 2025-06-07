import { Activity } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../lib/auth';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 mb-4">
          <Activity className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">FitTrack</h1>
        <p className="mt-2 text-center text-gray-600">
          Suivez votre progression et atteignez vos objectifs
        </p>
      </div>

      <AuthForm mode="signin" />

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
