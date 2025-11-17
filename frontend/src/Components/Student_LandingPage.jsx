import React, { useState } from 'react';
import { Search, Filter, BookOpen, Users, CheckCircle, Clock, XCircle, Plus, GraduationCap, Mail, Github, Linkedin } from 'lucide-react';

export default function MentorConnectDashboard() {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterCapacity, setFilterCapacity] = useState('all');

  const studentProfile = {
    name: "Tanish Iyer",
    id: "23FE10CSE00534",
    year: "3rd Year",
    cgpa: "8.7",
    skills: ["Python", "React", "Machine Learning", "Django"],
    interests: ["AI/ML", "Web Development", "Data Science"],
    github: "github.com/tanishiyer"
  };

  const mentorRequests = [
    {
      id: 1,
      mentor: "Dr. Priya Mehta",
      project: "Predictive Analytics for Healthcare",
      status: "pending",
      date: "2025-10-08",
      domain: "Machine Learning"
    },
    {
      id: 2,
      mentor: "Prof. Rajesh Kumar",
      project: "Real-time Chat Application with WebSockets",
      status: "approved",
      date: "2025-10-05",
      domain: "Web Development"
    },
    {
      id: 3,
      mentor: "Dr. Ananya Singh",
      project: "Blockchain-based Voting System",
      status: "changes_requested",
      date: "2025-10-03",
      domain: "Cybersecurity"
    }
  ];

  const availableMentors = [
    {
      id: 1,
      name: "Dr. Priya Mehta",
      designation: "Associate Professor",
      domains: ["Machine Learning", "Data Science", "AI"],
      capacity: "available",
      projects: 3,
      statement: "Looking for students interested in healthcare AI and predictive modeling. Strong Python and statistics background preferred."
    },
    {
      id: 2,
      name: "Prof. Rajesh Kumar",
      designation: "Assistant Professor",
      domains: ["Web Development", "Cloud Computing", "DevOps"],
      capacity: "limited",
      projects: 7,
      statement: "Focused on modern web architectures and scalable systems. Experience with React/Node.js is a plus."
    },
    {
      id: 3,
      name: "Dr. Ananya Singh",
      designation: "Professor",
      domains: ["Cybersecurity", "Blockchain", "Network Security"],
      capacity: "available",
      projects: 2,
      statement: "Interested in blockchain applications and cryptographic protocols. Looking for motivated students with strong problem-solving skills."
    },
    {
      id: 4,
      name: "Dr. Vikram Patel",
      designation: "Associate Professor",
      domains: ["Computer Vision", "Deep Learning", "AI"],
      capacity: "full",
      projects: 10,
      statement: "Working on image processing and CNN architectures. Not accepting new students this semester."
    },
    {
      id: 5,
      name: "Prof. Neha Gupta",
      designation: "Assistant Professor",
      domains: ["Database Systems", "Big Data", "Data Engineering"],
      capacity: "available",
      projects: 4,
      statement: "Focus on distributed databases and data pipeline optimization. SQL and NoSQL experience required."
    }
  ];

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

  const filteredMentors = availableMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDomain = filterDomain === 'all' || mentor.domains.includes(filterDomain);
    const matchesCapacity = filterCapacity === 'all' || mentor.capacity === filterCapacity;
    return matchesSearch && matchesDomain && matchesCapacity;
  });

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
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md">
                <Plus className="w-4 h-4 inline mr-2" />
                New Request
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{studentProfile.name}</p>
                  <p className="text-xs text-gray-500">{studentProfile.id}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {studentProfile.name.split(' ').map(n => n[0]).join('')}
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{mentorRequests.filter(r => r.status === 'pending').length}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{mentorRequests.filter(r => r.status === 'approved').length}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{availableMentors.filter(m => m.capacity === 'available').length}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{studentProfile.cgpa}</p>
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
                    {studentProfile.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Areas of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {studentProfile.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit Profile</button>
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
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Science">Data Science</option>
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
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}