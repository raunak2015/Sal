import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUniversity, FaUserGraduate, FaUserShield } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [role, setRole] = useState('student');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        if (role !== 'student') throw new Error('Only students can register');
        await register(name, email, password);
      } else {
        await login(email, password, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200">
            <FaUniversity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Sal College</h1>
          <p className="text-slate-500 font-medium mt-1">Digital Library Management</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
          <button 
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${role === 'student' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FaUserGraduate /> Student
          </button>
          <button 
            onClick={() => { setRole('admin'); setIsRegistering(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FaUserShield /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && role === 'student' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-100"
                required
              />
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'student' ? "student@sal.edu" : "admin@sal.edu"}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-medium">
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isRegistering ? 'Register' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {role === 'student' && (
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Demo Credentials</p>
          <div className="mt-2 text-sm text-slate-500 bg-slate-50 py-2 rounded-lg inline-block px-4">
            {role === 'student' ? 'student@sal.edu / student123' : 'admin@sal.edu / admin123'}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
