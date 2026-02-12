import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle, XCircle, MessageSquare, X, Check, 
  Trash2, ArrowLeft, Loader2, CheckCheck, Clock, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { unreadOnly: filter === 'unread' }
      });

      if (response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      const token = getAuthToken();
      
      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading('all');
      const token = getAuthToken();
      
      await axios.patch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setActionLoading(notificationId);
      const token = getAuthToken();
      
      await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const clearAllRead = async () => {
    try {
      setActionLoading('clear');
      const token = getAuthToken();
      
      await axios.delete(`${API_BASE_URL}/notifications/clear/read`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'request_rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'request_changes':
        return <MessageSquare className="w-6 h-6 text-orange-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type, read) => {
    if (read) return 'bg-white dark:bg-gray-800';
    
    switch (type) {
      case 'request_approved':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'request_rejected':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'request_changes':
        return 'bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/student-landing-page')}
            className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          {/* Notification Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Notifications</h1>
                  <p className="text-blue-100 text-sm">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={actionLoading === 'all'}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                >
                  {actionLoading === 'all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.some(n => n.read) && (
                <button
                  onClick={clearAllRead}
                  disabled={actionLoading === 'clear'}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                >
                  {actionLoading === 'clear' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Clear read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {filter === 'unread' 
                    ? "You're all caught up! Check back later." 
                    : "When mentors respond to your requests, you'll see notifications here."
                  }
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 transition-colors ${getNotificationBgColor(notification.type, notification.read)} ${
                    !notification.read ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            notification.read 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.data?.feedback && (
                            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                                Mentor's Feedback:
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                "{notification.data.feedback}"
                              </p>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.data?.request_id && (
                              <button
                                onClick={() => navigate(`/request-details/${notification.data.request_id}`)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                View Request
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              disabled={actionLoading === notification._id}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              {actionLoading === notification._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            disabled={actionLoading === notification._id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {actionLoading === notification._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}