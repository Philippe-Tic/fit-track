import { Loader2, Lock, LogIn, Mail, User, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../lib/auth';

type AuthFormProps = {
  mode: 'signin' | 'signup';
};

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'signin'
            ? 'Connectez-vous pour accéder à votre compte'
            : 'Créez un compte pour commencer à suivre votre progression'}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'signup' && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <User size={18} />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Mail size={18} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="exemple@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="relative mt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn className="w-5 h-5 mr-2" />
            ) : (
              <UserPlus className="w-5 h-5 mr-2" />
            )}
            {mode === 'signin' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
