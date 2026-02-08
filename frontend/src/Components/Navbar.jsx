import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function Navigation() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">MentorMatch</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/signin')}
              className="bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;