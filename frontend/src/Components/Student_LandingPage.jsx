import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Users, CheckCircle, Clock, XCircle, Plus, GraduationCap, Mail, Github, Linkedin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Normalizes a domain string to Title Case for consistent display and comparison
 * e.g., "machine learning" -> "Machine Learning"
 *       "MACHINE LEARNING" -> "Machine Learning"
 *       "machine LEARNING" -> "Machine Learning"
 */
const normalizeDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return '';
  return domain
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Creates a normalized key for grouping domains (lowercase, trimmed, single spaces)
 */
const getDomainKey = (domain) => {
  if (!domain || typeof domain !== 'string') return '';
  return domain.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Takes an array of domains and returns unique normalized domains
 * Handles duplicates caused by different casing
 */
const getUniqueDomains = (domains) => {
  const domainMap = new Map();
  
  domains.forEach(domain => {
    const key = getDomainKey(domain);
    if (key && !domainMap.has(key)) {
      domainMap.set(key, normalizeDomain(domain));
    }
  });
  
  // Sort alphabetically for better UX
  return Array.from(domainMap.values()).sort((a, b) => a.localeCompare(b));
};

/**
 * Normalizes an array of domains for a mentor
 * Returns array with consistent Title Case formatting
 */
const normalizeMentorDomains = (domains) => {
  if (!Array.isArray(domains)) return [];
  return domains.map(d => normalizeDomain(d)).filter(d => d);
};

export default function MentorConnectDashboard() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterCapacity, setFilterCapacity] = useState('all');
  const navigate = useNavigate();

  // State for data from backend
  const [studentProfile, setStudentProfile] = useState(null);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  
  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  
  // Error states
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch student profile
  const fetchStudentProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/user/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.profile) {
        const profile = response.data.profile;
        setStudentProfile({
          name: profile.user_id?.name || 'Student',
          id: profile.registration_no,
          year: `${profile.year}${getYearSuffix(profile.year)} Year`,
          cgpa: profile.cgpa?.toString() || 'N/A',
          skills: profile.skills || [],
          interests: profile.interest || [],
          github: profile.github || ''
        });
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      // If profile fetch fails, we might not have a GET endpoint yet
      // Set a default profile or handle gracefully
      setStudentProfile({
        name: 'Student',
        id: 'N/A',
        year: 'N/A',
        cgpa: 'N/A',
        skills: [],
        interests: [],
        github: ''
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch mentor requests for the student
  const fetchMentorRequests = async () => {
    try {
      setLoadingRequests(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/project/requests/student`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.requests) {
        const formattedRequests = response.data.requests.map(request => ({
          id: request._id,
          mentor: request.mentor_id?.name || 'Unknown Mentor',
          project: request.projectTitle,
          status: request.status,
          date: request.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          domain: request.techStack?.[0] || 'General'
        }));
        setMentorRequests(formattedRequests);
      }
    } catch (err) {
      console.error('Error fetching mentor requests:', err);
      setMentorRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch available mentors
  const fetchAvailableMentors = async () => {
    try {
      setLoadingMentors(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/teacher/mentors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.mentors) {
        const formattedMentors = response.data.mentors.map(mentor => {
          // Combine skills and interests, then normalize for consistent display
          const rawDomains = [...(mentor.skills || []), ...(mentor.interest || [])];
          const normalizedDomains = normalizeMentorDomains(rawDomains);
          
          return {
            id: mentor._id,
            name: mentor.user_id?.name || 'Unknown',
            designation: mentor.designation || 'Faculty',
            domains: normalizedDomains,
            // Keep raw domains for display variety if needed
            rawDomains: rawDomains,
            capacity: mapCapacity(mentor.capacity),
            projects: mentor.currentProjects || 0,
            statement: mentor.statement || `Expert in ${(mentor.skills || []).join(', ')}. Looking for motivated students.`,
            email: mentor.user_id?.email || ''
          };
        });
        setAvailableMentors(formattedMentors);
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setAvailableMentors([]);
    } finally {
      setLoadingMentors(false);
    }
  };

  // Helper function to map capacity values
  const mapCapacity = (capacity) => {
    switch (capacity) {
      case 'available':
        return 'available';
      case 'limited slots':
        return 'limited';
      case 'full':
        return 'full';
      default:
        return 'available';
    }
  };

  // Helper function for year suffix
  const getYearSuffix = (year) => {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  };

  // Fetch all data on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/signin');
      return;
    }
    
    fetchStudentProfile();
    fetchMentorRequests();
    fetchAvailableMentors();
  }, [navigate]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'changes_requested': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'changes_requested': return <Mail className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCapacityBadge = (capacity) => {
    switch(capacity) {
      case 'available': return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Available</span>;
      case 'limited': return <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">Limited Slots</span>;
      case 'full': return <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">Full</span>;
      default: return null;
    }
  };

  // Memoized unique domains from all mentors for filter dropdown
  // Uses normalized domains to eliminate case-based duplicates
  const allDomains = useMemo(() => {
    const allMentorDomains = availableMentors.flatMap(m => m.domains);
    return getUniqueDomains(allMentorDomains);
  }, [availableMentors]);

  // Filtered mentors with case-insensitive domain matching
  const filteredMentors = useMemo(() => {
    return availableMentors.filter(mentor => {
      // Case-insensitive search in name and domains
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        mentor.name.toLowerCase().includes(searchLower) ||
        mentor.domains.some(d => d.toLowerCase().includes(searchLower));
      
      // Case-insensitive domain filter matching
      const matchesDomain = filterDomain === 'all' || 
        mentor.domains.some(d => getDomainKey(d) === getDomainKey(filterDomain));
      
      const matchesCapacity = filterCapacity === 'all' || mentor.capacity === filterCapacity;
      
      return matchesSearch && matchesDomain && matchesCapacity;
    });
  }, [availableMentors, searchQuery, filterDomain, filterCapacity]);

  // Loading state
  const isLoading = loadingProfile || loadingRequests || loadingMentors;

  if (isLoading && !studentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MentorConnect</h1>
                <p className="text-sm text-gray-500">CSE Project Mentorship Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md" onClick={()=>navigate('/project-request')}>
                <Plus className="w-4 h-4 inline mr-2" />
                New Request
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{studentProfile?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{studentProfile?.id || 'N/A'}</p>
                </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full 
                  flex items-center justify-center text-white font-semibold 
                  cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/student-profile-page')}
                >
                  {(studentProfile?.name || 'S').split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loadingRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : mentorRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loadingRequests ? <Loader2 className="w-6 h-6 animate-spin" /> : mentorRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Available Mentors</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loadingMentors ? <Loader2 className="w-6 h-6 animate-spin" /> : availableMentors.filter(m => m.capacity === 'available').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Your CGPA</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{studentProfile?.cgpa || 'N/A'}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills & Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {(studentProfile?.skills || []).length > 0 ? (
                      studentProfile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No skills added yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Areas of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {(studentProfile?.interests || []).length > 0 ? (
                      studentProfile.interests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No interests added yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => navigate('/student-profile-page')}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'browse'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Browse Mentors
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Requests
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  {mentorRequests.filter(r => r.status === 'pending').length}
                </span>
              </button>
            </div>
          </div>

          {/* Browse Mentors Tab */}
          {activeTab === 'browse' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Domains</option>
                  {allDomains.map((domain, idx) => (
                    <option key={idx} value={domain}>{domain}</option>
                  ))}
                </select>
                <select
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="limited">Limited Slots</option>
                  <option value="full">Full</option>
                </select>
              </div>

              {/* Mentor Cards */}
              {loadingMentors ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No mentors found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMentors.map((mentor) => (
                    <div key={mentor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {mentor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                            <p className="text-sm text-gray-500">{mentor.designation}</p>
                            <p className="text-xs text-gray-400 mt-1">Currently mentoring {mentor.projects} projects</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getCapacityBadge(mentor.capacity)}
                          <button
                            disabled={mentor.capacity === 'full'}
                            onClick={() => navigate('/project-request', { state: { selectedMentor: mentor } })}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              mentor.capacity === 'full'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Send Request
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{mentor.statement}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mentor.domains.map((domain, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-6">
              {loadingRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : mentorRequests.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't submitted any project requests yet.</p>
                  <button 
                    onClick={() => navigate('/project-request')}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Request
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentorRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{request.project}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Mentor: <span className="font-medium">{request.mentor}</span></p>
                          <p className="text-xs text-gray-400 mt-1">Domain: {request.domain} • Submitted on {new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                          {request.status === 'changes_requested' && (
                            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                              Resubmit
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
        </div>
      </div>
    </div>
  );
}