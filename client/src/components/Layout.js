import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Trophy,
  Users,
  BarChart3,
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import ConnectionStatus from './common/ConnectionStatus';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Torneos', href: '/tournaments', icon: Trophy },
    { name: 'Jugadores', href: '/players', icon: Users },
    { name: 'Ranking', href: '/ranking', icon: BarChart3 },
    { name: 'Perfil', href: '/profile', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Sistema TT</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-4 w-4 ${
                        isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Connection status */}
              <ConnectionStatus />
              
              {/* User info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-sm text-right">
                  <p className="font-medium text-gray-900">{user?.nombre}</p>
                  <p className="text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden lg:inline">Cerrar sesión</span>
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 text-gray-700 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile user info */}
              <div className="px-3 py-2 border-t border-gray-200 mt-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.nombre}</p>
                  <p className="text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

