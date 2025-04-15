import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, FileSpreadsheet, AlertTriangle, Info, X } from 'lucide-react';

// State Street Logo component to be used across the application
export const StateStreetLogo = () => (
  <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="200" height="40" rx="5" fill="#05386B" />
    <text x="120" y="48" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">STATE STREET</text>
    <path d="M30 40 H55 M30 50 H45" stroke="white" strokeWidth="2" />
    <path d="M210 40 H185 M210 50 H195" stroke="white" strokeWidth="2" />
  </svg>
);

/**
 * Common Header component for all pages
 * This component can be used in both the ExcelListPage and Dashboard components
 */
const CommonHeader = ({ 
  user, 
  title,
  subtitle = null,
  isDarkMode = false, 
  toggleDarkMode = null,
  onLogout = null,
  notifications = [],
  dismissNotification = null,
  setNotifications = null,
  sheets = [],
  activeSheet = '',
  changeSheet = null
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Handle clicks outside the notification panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Default logout handler
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedExcel');
    
    // Call custom logout handler if provided
    if (onLogout) {
      onLogout();
    } else {
      // Default behavior: redirect to login
      navigate('/login');
    }
  };

  // Helper to check if we have unread notifications
  const hasUnreadNotifications = notifications && notifications.some(n => !n.read);

  return (
    <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-700' : 'bg-white shadow-gray-200'} shadow`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Left side: Logo and title */}
        <div className="flex items-center">
          <div className="w-40 h-12 mr-4">
            <StateStreetLogo />
          </div>
          <div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {title}
            </h1>
            {subtitle && (
              <div className="flex items-center text-sm mt-1">
                <FileSpreadsheet className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-blue-400' : 'text-indigo-600'}`} />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {subtitle}
                </span>
              </div>
            )}
          </div>
        
          {/* Sheet selector - Only shown if sheets are provided */}
          {sheets && sheets.length > 0 && (
            <div className="ml-6 relative">
              <select
                value={activeSheet}
                onChange={(e) => changeSheet && changeSheet(e.target.value)}
                className={`pl-3 pr-10 py-1 text-sm rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {sheets.map(sheet => (
                  <option key={sheet} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>
          )}
        </div>
          
        {/* Right side: Notifications, dark mode toggle, user profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Only shown if notifications array is provided */}
          {notifications && notifications.length > 0 && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } relative`}
                aria-label="Notifications"
              >
                <Bell className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } rounded-md shadow-lg border overflow-hidden z-10`}>
                  <div className={`${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } border-b px-4 py-2 flex justify-between items-center`}>
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Notifications
                    </h3>
                    <button
                      onClick={() => setNotifications && setNotifications([])}
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-4 px-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 ${notification.read ? 'opacity-70' : ''} ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-100'
                          } border-b flex items-start`}
                        >
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {notification.type === 'success' && <Info className="h-5 w-5 text-green-500" />}
                            {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissNotification && dismissNotification(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            aria-label="Dismiss notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Dark mode toggle - Only shown if toggle function is provided */}
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          )}
          
          {/* User profile and logout */}
          {user && (
            <div className="flex items-center">
              <span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {user}
              </span>
              <button 
                onClick={handleLogout}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                  isDarkMode
                    ? 'text-white bg-red-700 hover:bg-red-800'
                    : 'text-white bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CommonHeader;