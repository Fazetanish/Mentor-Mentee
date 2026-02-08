import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Code, 
  Target, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  Calendar,
  Users,
  Loader2,
  MessageSquare,
  Lightbulb,
  Timer
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function RequestDetails() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required. Please log in.');
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/project/request/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.request) {
        setRequest(response.data.request);
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/signin');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this request.');
      } else if (err.response?.status === 404) {
        setError('Request not found.');
      } else {
        setError('Failed to load request details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'approved':
        return {
          color: 'text-green-600 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5" />,
          label: 'Approved',
          description: 'Your project request has been approved by the mentor.'
        };
      case 'pending':
        return {
          color: 'text-yellow-600 dark:text-yellow-300',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: <Clock className="w-5 h-5" />,
          label: 'Pending Review',
          description: 'Your request is awaiting review from the mentor.'
        };
      case 'rejected':
        return {
          color: 'text-red-600 dark:text-red-300',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <XCircle className="w-5 h-5" />,
          label: 'Rejected',
          description: 'Unfortunately, your request was not approved.'
        };
      case 'changes_requested':
        return {
          color: 'text-orange-600 dark:text-orange-300',
          bgColor: 'bg-orange-50 dark:bg-orange-900/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Changes Requested',
          description: 'The mentor has requested some changes to your proposal.'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-900',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: <Clock className="w-5 h-5" />,
          label: 'Unknown',
          description: ''
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/student-landing-page')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const statusConfig = getStatusConfig(request.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student-landing-page')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Request Details</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">View your project request information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-6 mb-6`}>
          <div className="flex items-start space-x-4">
            <div className={`${statusConfig.color} mt-0.5`}>
              {statusConfig.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted on {formatDate(request.createdAt)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{statusConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Mentor Feedback Section (if available) */}
        {request.mentorFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mentor Feedback</h3>
                {request.respondedAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Responded on {formatDate(request.respondedAt)}</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.mentorFeedback}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Title</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{request.projectTitle}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.description}</p>
                </div>
              </div>
            </div>

            {/* Methodology & Tech Stack */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Methodology & Technology</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Methodology</label>
                  <p className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.methodology}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Technology Stack</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(request.techStack || []).map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-100 dark:border-blue-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Goals & Outcomes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Goals & Outcomes</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Objectives</label>
                  <p className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.objectives}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Outcome</label>
                  <p className="mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.expectedOutcome}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes (if available) */}
            {request.additionalNotes && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Notes</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{request.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Mentor Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {(request.mentor_id?.name || 'M').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{request.mentor_id?.name || 'Unknown Mentor'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mentor</p>
                </div>
              </div>
              {request.mentor_id?.email && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Mail className="w-4 h-4" />
                  <span>{request.mentor_id.email}</span>
                </div>
              )}
            </div>

            {/* Project Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Team Size</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.teamSize} member(s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Submitted</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {request.status === 'changes_requested' && (
                <button
                  onClick={() => navigate('/project-request', { 
                    state: { 
                      editRequest: request,
                      selectedMentor: {
                        id: request.mentor_id?._id,
                        name: request.mentor_id?.name,
                        email: request.mentor_id?.email
                      }
                    } 
                  })}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Revise & Resubmit
                </button>
              )}
              <button
                onClick={() => navigate('/student-landing-page')}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}