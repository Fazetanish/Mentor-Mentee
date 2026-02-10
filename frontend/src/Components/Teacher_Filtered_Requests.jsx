import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Clock, CheckCircle, XCircle, Mail, 
  GraduationCap, Eye, ThumbsUp, MessageSquare, Loader2, 
  X, ArrowLeft, Users, AlertCircle, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export default function FilteredRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'changes_requested'
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const navigate = useNavigate();

  // State for data
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action states
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionError, setActionError] = useState('');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Helper function for year suffix
  const getYearSuffix = (year) => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  };

  // Fetch all requests for the mentor
  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/project/requests/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.requests) {
        const formattedRequests = response.data.requests
          .filter(request => request.status !== 'rejected') // Filter out rejected requests
          .map(request => {
            const submittedDate = new Date(request.createdAt);
            const now = new Date();
            const daysAgo = Math.floor((now - submittedDate) / (1000 * 60 * 60 * 24));
            
            return {
              id: request._id,
              student: {
                id: request.student_id?._id,
                name: request.student_id?.name || 'Unknown Student',
                email: request.student_id?.email || '',
                regNo: request.studentRegNo || 'N/A',
                year: request.studentYear || null,
                yearDisplay: request.studentYear ? `${request.studentYear}${getYearSuffix(request.studentYear)} Year` : 'N/A',
                semester: request.studentSemester || null,
                semesterDisplay: request.studentSemester ? `Semester ${request.studentSemester}` : 'N/A',
                cgpa: request.studentCgpa?.toString() || 'N/A',
                skills: request.studentSkills || [],
                interests: request.studentInterests || [],
                github: request.studentGithub || '',
                section: request.studentSection || ''
              },
              project: {
                title: request.projectTitle,
                description: request.description,
                methodology: request.methodology,
                techStack: request.techStack || [],
                objectives: request.objectives,
                expectedOutcome: request.expectedOutcome,
                duration: request.duration,
                teamSize: request.teamSize,
                domain: request.techStack?.[0] || 'General'
              },
              status: request.status,
              submittedDate: request.createdAt?.split('T')[0],
              daysAgo: daysAgo,
              feedback: request.mentorFeedback || '',
              respondedAt: request.respondedAt
            };
          });
        setAllRequests(formattedRequests);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle request action (approve/reject/request changes)
  const handleRequestAction = async (requestId, status, feedback = '') => {
    try {
      setProcessingRequest(requestId);
      setActionError('');
      const token = getAuthToken();
      
      await axios.patch(
        `${API_BASE_URL}/project/request/${requestId}`,
        {
          status: status,
          mentorFeedback: feedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh requests after action
      await fetchAllRequests();
      
      // Close feedback modal if open
      setShowFeedbackModal(false);
      setSelectedRequest(null);
      setFeedbackText('');
    } catch (err) {
      console.error('Error processing request:', err);
      setActionError(err.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessingRequest(null);
    }
  };

  // Open feedback modal for requesting changes
  const openFeedbackModal = (request) => {
    setSelectedRequest(request);
    setFeedbackText('');
    setShowFeedbackModal(true);
    setActionError('');
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchAllRequests();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700';
      case 'changes_requested': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'changes_requested': return <Mail className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Get unique semesters and years from requests for filter dropdowns
  const uniqueSemesters = [...new Set(allRequests.map(r => r.student.semester).filter(s => s !== null))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(allRequests.map(r => r.student.year).filter(y => y !== null))].sort((a, b) => a - b);

  // Filter requests based on all criteria
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.student.regNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    const matchesSemester = filterSemester === 'all' || 
                           (request.student.semester && request.student.semester.toString() === filterSemester);
    
    const matchesYear = filterYear === 'all' || 
                       (request.student.year && request.student.year.toString() === filterYear);
    
    return matchesSearch && matchesStatus && matchesSemester && matchesYear;
  });

  // Stats
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    changesRequested: allRequests.filter(r => r.status === 'changes_requested').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-gray-900 dark:to-teal-950">
      {/* Feedback Modal */}
      {showFeedbackModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request Changes</h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Provide feedback for <span className="font-medium">{selectedRequest.student.name}</span> regarding their project request.
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Explain what changes are needed..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
            />
            {actionError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 dark:text-red-300">{actionError}</span>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestAction(selectedRequest.id, 'changes_requested', feedbackText)}
                disabled={!feedbackText.trim() || processingRequest === selectedRequest.id}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {processingRequest === selectedRequest.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Feedback'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/teacher-landing-page')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 rounded-lg">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">All Requests</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Filter and manage student requests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Changes Requested</p>
                <p className="text-2xl font-bold text-orange-600">{stats.changesRequested}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, title, or reg no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">🟡 Pending</option>
                <option value="approved">🟢 Approved</option>
                <option value="changes_requested">🟠 Changes Requested</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Semester Filter */}
            <div className="relative">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {uniqueSemesters.map((sem) => (
                  <option key={sem} value={sem.toString()}>Semester {sem}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Year Filter */}
            <div className="relative">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year.toString()}>{year}{getYearSuffix(year)} Year</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || filterSemester !== 'all' || filterYear !== 'all' || searchQuery) && (
            <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-2 hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full">
                  Status: {filterStatus.replace('_', ' ')}
                  <button onClick={() => setFilterStatus('all')} className="ml-2 hover:text-emerald-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterSemester !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                  Semester {filterSemester}
                  <button onClick={() => setFilterSemester('all')} className="ml-2 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterYear !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                  {filterYear}{getYearSuffix(parseInt(filterYear))} Year
                  <button onClick={() => setFilterYear('all')} className="ml-2 hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterSemester('all');
                  setFilterYear('all');
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Results
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'})
                </span>
              </h2>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No requests found matching your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterSemester('all');
                    setFilterYear('all');
                  }}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {request.student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{request.student.name}</h3>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(request.status)} flex items-center space-x-1`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {request.student.regNo} • {request.student.yearDisplay} • {request.student.semesterDisplay} • CGPA: {request.student.cgpa}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Submitted {request.daysAgo} {request.daysAgo === 1 ? 'day' : 'days'} ago
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{request.project.title}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                          {request.project.domain}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{request.project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(request.project.techStack || []).slice(0, 4).map((tech, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            {tech}
                          </span>
                        ))}
                        {(request.project.techStack || []).length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{request.project.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skills & Interests */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {(request.student.skills || []).slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {(request.student.skills || []).length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{request.student.skills.length - 3}
                            </span>
                          )}
                          {(request.student.skills || []).length === 0 && (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">No skills listed</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {(request.student.interests || []).slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                          {(request.student.interests || []).length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{request.student.interests.length - 3}
                            </span>
                          )}
                          {(request.student.interests || []).length === 0 && (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">No interests listed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section (if changes requested) */}
                    {request.status === 'changes_requested' && request.feedback && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-orange-900 dark:text-orange-300">Feedback Provided</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">{request.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      {request.student.github ? (
                        <a 
                          href={request.student.github.startsWith('http') ? request.student.github : `https://${request.student.github}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View GitHub</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">No GitHub</span>
                      )}
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              disabled={processingRequest === request.id}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              {processingRequest === request.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span>Reject</span>
                            </button>
                            <button 
                              onClick={() => openFeedbackModal(request)}
                              disabled={processingRequest === request.id}
                              className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Request Changes</span>
                            </button>
                            <button 
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              disabled={processingRequest === request.id}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              {processingRequest === request.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ThumbsUp className="w-3.5 h-3.5" />
                              )}
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                        {request.status !== 'pending' && (
                          <button 
                            onClick={() => navigate(`/request-details/${request.id}`)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}