import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${className}
      `}
      title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
    >
      <div className="relative w-5 h-5">
        {/* Ícone do Sol */}
        <Sun
          className={`
            absolute inset-0 w-5 h-5 text-yellow-500
            transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        
        {/* Ícone da Lua */}
        <Moon
          className={`
            absolute inset-0 w-5 h-5 text-blue-400
            transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
