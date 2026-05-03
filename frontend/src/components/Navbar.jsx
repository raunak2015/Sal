import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-4 z-40 mx-4 mb-8 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Sal E-Library</h1>
          <p className="text-sm font-medium text-blue-600 sm:hidden">{title}</p>
        </div>
      </div>

      <div className="hidden sm:block">
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <User size={16} />
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="font-medium hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
