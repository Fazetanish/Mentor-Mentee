import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Users, CheckCircle, Clock, XCircle, Mail, 
  GraduationCap, FileText, TrendingUp, AlertCircle, Eye, ThumbsUp, 
  ThumbsDown, MessageSquare, Loader2, X ,Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export default function TeacherLandingPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const navigate = useNavigate();

  // State for data from backend
  const [mentorProfile, setMentorProfile] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [studentPool, setStudentPool] = useState([]);
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
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

  // Fetch teacher profile
  const fetchTeacherProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/teacher/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.profile) {
        const profile = response.data.profile;
        setMentorProfile({
          id: profile._id,
          name: profile.user_id?.name || 'Teacher',
          email: profile.user_id?.email || '',
          designation: profile.designation || 'Faculty',
          capacity: profile.capacity || 'available',
          domains: [...(profile.skills || []), ...(profile.interest || [])],
          skills: profile.skills || [],
          interests: profile.interest || [],
          statement: profile.statement || '',
          currentProjects: profile.currentProjects || 0,
          maxCapacity: profile.maxCapacity || 8
        });
      }
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
      if (err.response?.status === 404) {
        // Profile doesn't exist, redirect to profile creation
        navigate('/teacher-profile');
      } else {
        setMentorProfile({
          name: 'Teacher',
          email: '',
          designation: 'Faculty',
          capacity: 'available',
          domains: [],
          skills: [],
          interests: [],
          statement: '',
          currentProjects: 0,
          maxCapacity: 8
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch incoming requests for the mentor
  const fetchIncomingRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/project/requests/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.requests) {
        const formattedRequests = response.data.requests.map(request => {
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
              year: request.studentYear || 'N/A',
              cgpa: request.studentCgpa || 'N/A',
              skills: request.studentSkills || [],
              interests: request.studentInterests || [],
              github: request.studentGithub || ''
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
        setIncomingRequests(formattedRequests);
      }
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
      setIncomingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch student pool (all students for browsing)
  const fetchStudentPool = async () => {
    try {
      setLoadingStudents(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/user/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.students) {
        const formattedStudents = response.data.students.map(student => ({
          id: student._id,
          name: student.user_id?.name || 'Unknown',
          email: student.user_id?.email || '',
          regNo: student.registration_no || 'N/A',
          year: `${student.year}${getYearSuffix(student.year)} Year`,
          cgpa: student.cgpa?.toString() || 'N/A',
          skills: student.skills || [],
          interests: student.interest || [],
          github: student.github || ''
        }));
        setStudentPool(formattedStudents);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      // For now, set empty array - the endpoint might not exist yet
      setStudentPool([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Helper function for year suffix
  const getYearSuffix = (year) => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
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
      await fetchIncomingRequests();
      
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

  // Fetch all data on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/signin');
      return;
    }
    
    fetchTeacherProfile();
    fetchIncomingRequests();
    fetchStudentPool();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700';
      case 'changes_requested': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'changes_requested': return <Mail className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCapacityColor = (capacity) => {
    switch(capacity) {
      case 'available': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'limited slots': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      case 'full': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Get unique domains from all requests for filter dropdown
  const allDomains = [...new Set(incomingRequests.flatMap(r => r.project.techStack || []))];

  const filteredRequests = incomingRequests.filter(request => {
    const matchesSearch = request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesDomain = filterDomain === 'all' || 
                          (request.project.techStack || []).some(t => t.toLowerCase() === filterDomain.toLowerCase());
    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Get active projects (approved requests)
  const activeProjects = incomingRequests.filter(r => r.status === 'approved');

  // Loading state
  const isLoading = loadingProfile && loadingRequests;

  if (isLoading && !mentorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-gray-900 dark:to-teal-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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

            {/* LEFT SIDE */}
            <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
                </div>

                <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    MentorConnect
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Faculty Mentorship Dashboard
                </p>
                </div>

                {/* All Requests button beside MentorConnect */}
                <button
                onClick={() => navigate('/all-requests')}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center space-x-2"
                >
                <Filter className="w-4 h-4" />
                <span>All Requests</span>
                </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center space-x-3">
                <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {mentorProfile?.name || 'Teacher'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {mentorProfile?.designation || 'Faculty'}
                </p>
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(mentorProfile?.name || 'T')
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
            </div>

            </div>
        </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {loadingRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : incomingRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {loadingRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : activeProjects.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Capacity</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {activeProjects.length}/{mentorProfile?.maxCapacity || 8}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getCapacityColor(mentorProfile?.capacity || 'available')}`}>
                  {(mentorProfile?.capacity || 'available').charAt(0).toUpperCase() + (mentorProfile?.capacity || 'available').slice(1)}
                </span>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Mentorship Profile</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {mentorProfile?.statement || 'Add a statement to let students know what kind of projects you are interested in mentoring.'}
              </p>
            </div>
            <button 
              onClick={() => navigate('/teacher-profile')}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Update
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Areas of Expertise</p>
              <div className="flex flex-wrap gap-2">
                {(mentorProfile?.domains || []).length > 0 ? (
                  mentorProfile.domains.map((domain, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm">No expertise areas added yet</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contact Information</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{mentorProfile?.email || 'No email available'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Incoming Requests
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-semibold rounded-full">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Active Projects
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'students'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Student Pool
              </button>
            </div>
          </div>

          {/* Incoming Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by student name or project title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Domains</option>
                  {allDomains.map((domain, idx) => (
                    <option key={idx} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              {/* Request Cards */}
              {loadingRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No requests found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {request.student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{request.student.name}</h3>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)} flex items-center space-x-1`}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{request.student.regNo} • {request.student.year} • CGPA: {request.student.cgpa}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Submitted {request.daysAgo} days ago</p>
                          </div>
                        </div>
                      </div>

                      {/* Student Skills & Interests */}
                      <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Skills</p>
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Interests</p>
                          <div className="flex flex-wrap gap-1">
                            {(request.student.interests || []).map((interest, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                {interest}
                              </span>
                            ))}
                            {(request.student.interests || []).length === 0 && (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">No interests listed</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{request.project.title}</h4>
                          <span className="px-2 py-1 bg-emerald-200 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-full">
                            {request.project.domain}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">{request.project.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Methodology & Tech Stack</p>
                            <p className="text-gray-700 dark:text-gray-200">{request.project.methodology}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(request.project.techStack || []).map((tech, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Expected Outcomes</p>
                            <p className="text-gray-700 dark:text-gray-200">{request.project.objectives}</p>
                          </div>
                        </div>
                      </div>

                      {/* Feedback Section (if changes requested) */}
                      {request.status === 'changes_requested' && request.feedback && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-4">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Feedback Provided</p>
                              <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">{request.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        {request.student.github ? (
                          <a 
                            href={request.student.github.startsWith('http') ? request.student.github : `https://${request.student.github}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View GitHub Profile</span>
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No GitHub profile</span>
                        )}
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleRequestAction(request.id, 'rejected')}
                                disabled={processingRequest === request.id}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                <span>Reject</span>
                              </button>
                              <button 
                                onClick={() => openFeedbackModal(request)}
                                disabled={processingRequest === request.id}
                                className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>Request Changes</span>
                              </button>
                              <button 
                                onClick={() => handleRequestAction(request.id, 'approved')}
                                disabled={processingRequest === request.id}
                                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ThumbsUp className="w-4 h-4" />
                                )}
                                <span>Approve</span>
                              </button>
                            </>
                          )}
                          {request.status !== 'pending' && (
                            <button 
                              onClick={() => navigate(`/request-details/${request.id}`)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
          )}

          {/* Active Projects Tab */}
          {activeTab === 'active' && (
            <div className="p-6">
              {loadingRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No active projects yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Approved project requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{project.project.title}</h3>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            Student: <span className="font-medium">{project.student.name}</span> ({project.student.regNo})
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Duration: {project.project.duration} • Started: {new Date(project.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <button 
                          onClick={() => navigate(`/request-details/${project.id}`)}
                          className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(project.project.techStack || []).map((tech, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Student Pool Tab */}
          {activeTab === 'students' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Discover Potential Students</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Browse student profiles to find promising candidates for your research areas</p>
              </div>
              {loadingStudents ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : studentPool.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No students found.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Student profiles will appear here as they register.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentPool.map((student, idx) => (
                    <div key={student.id || idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{student.regNo} • {student.year} • CGPA: {student.cgpa}</p>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Skills</p>
                                <div className="flex flex-wrap gap-1">
                                  {(student.skills || []).map((skill, skillIdx) => (
                                    <span key={skillIdx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                  {(student.skills || []).length === 0 && (
                                    <span className="text-gray-400 dark:text-gray-500 text-xs">No skills listed</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Interests</p>
                                <div className="flex flex-wrap gap-1">
                                  {(student.interests || []).map((interest, interestIdx) => (
                                    <span key={interestIdx} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                      {interest}
                                    </span>
                                  ))}
                                  {(student.interests || []).length === 0 && (
                                    <span className="text-gray-400 dark:text-gray-500 text-xs">No interests listed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {student.github && (
                            <a 
                              href={student.github.startsWith('http') ? student.github : `https://${student.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}