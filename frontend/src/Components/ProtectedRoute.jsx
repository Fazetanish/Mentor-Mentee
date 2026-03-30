import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';

/**
 * ProtectedRoute - Wraps pages that are restricted to a specific role.
 * 
 * Props:
 *   - allowedRole: 'student' | 'teacher' — which role can access this page
 *   - children: the page component to render if authorized
 * 
 * If the user's role (from localStorage) doesn't match the allowedRole,
 * it shows an "Unauthorized Access" error screen and logs the user out.
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // No token at all → redirect to signin
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }

    // Role mismatch → unauthorized
    if (userRole !== allowedRole) {
      setAuthorized(false);
      return;
    }

    // Authorized
    setAuthorized(true);
  }, [allowedRole, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/signin', { replace: true });
  };

  // Still checking
  if (authorized === null) {
    return null;
  }

  // Unauthorized — show error + auto-logout
  if (authorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-red-100 dark:border-red-900/50">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Unauthorized Access
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            You do not have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            This page is restricted to <span className="font-semibold text-red-600 dark:text-red-400 capitalize">{allowedRole}s</span> only. 
            You will be logged out for security reasons.
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out & Return to Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  // Authorized — render the page
  return children;
}
