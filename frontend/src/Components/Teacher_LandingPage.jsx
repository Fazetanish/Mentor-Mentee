import React, { useState } from 'react';
import { Search, Filter, BookOpen, Users, CheckCircle, Clock, XCircle, Mail, GraduationCap, FileText, TrendingUp, AlertCircle, Eye, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherLandingPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const navigate = useNavigate();

  const mentorProfile = {
    name: "Dr. Priya Mehta",
    designation: "Associate Professor",
    email: "priya.mehta@jaipur.manipal.edu",
    capacity: "available",
    domains: ["Machine Learning", "Data Science", "AI"],
    currentProjects: 3,
    maxCapacity: 8,
    statement: "Looking for students interested in healthcare AI and predictive modeling. Strong Python and statistics background preferred."
  };

  const incomingRequests = [
    {
      id: 1,
      student: {
        name: "Tanish Iyer",
        regNo: "23FE10CSE00534",
        year: "3rd Year",
        cgpa: "8.7",
        skills: ["Python", "React", "Machine Learning", "Django"],
        interests: ["AI/ML", "Web Development"],
        github: "github.com/tanishiyer"
      },
      project: {
        title: "Predictive Analytics for Healthcare",
        description: "A machine learning system to predict patient readmission rates using historical hospital data. Will implement various ML algorithms including Random Forest, XGBoost, and Neural Networks to compare performance.",
        methodology: "Python, Scikit-learn, TensorFlow, Pandas",
        objectives: "Achieve 85%+ accuracy in predicting 30-day readmission rates",
        domain: "Machine Learning"
      },
      status: "pending",
      submittedDate: "2025-01-28",
      daysAgo: 5
    },
    {
      id: 2,
      student: {
        name: "Arjun Patel",
        regNo: "23FE10CSE00421",
        year: "4th Year",
        cgpa: "9.1",
        skills: ["Python", "Deep Learning", "Computer Vision", "PyTorch"],
        interests: ["AI/ML", "Computer Vision"],
        github: "github.com/arjunpatel"
      },
      project: {
        title: "Real-time Object Detection for Autonomous Vehicles",
        description: "Implementation of YOLO and Faster R-CNN models for detecting pedestrians, vehicles, and traffic signs in real-time video streams from vehicle cameras.",
        methodology: "PyTorch, OpenCV, YOLO v8, Custom Dataset Collection",
        objectives: "Real-time detection at 30+ FPS with mAP > 0.75",
        domain: "Machine Learning"
      },
      status: "pending",
      submittedDate: "2025-01-30",
      daysAgo: 3
    },
    {
      id: 3,
      student: {
        name: "Sneha Reddy",
        regNo: "23FE10CSE00298",
        year: "3rd Year",
        cgpa: "8.2",
        skills: ["Python", "NLP", "Flask", "MongoDB"],
        interests: ["AI/ML", "Natural Language Processing"],
        github: "github.com/snehareddy"
      },
      project: {
        title: "Sentiment Analysis Dashboard for Social Media",
        description: "Web-based dashboard for analyzing sentiment trends from Twitter data using BERT and other transformer models. Will include visualization and real-time monitoring capabilities.",
        methodology: "Python, Transformers, Flask, React, MongoDB",
        objectives: "Build scalable NLP pipeline processing 10k+ tweets/hour",
        domain: "Data Science"
      },
      status: "changes_requested",
      submittedDate: "2025-01-25",
      daysAgo: 8,
      feedback: "Please provide more details on the data collection strategy and ethical considerations for social media analysis."
    }
  ];

  const activeProjects = [
    {
      id: 1,
      student: "Rahul Sharma",
      regNo: "22FE10CSE00156",
      title: "COVID-19 Spread Prediction Model",
      domain: "Machine Learning",
      progress: 75,
      startDate: "2024-09-15",
      status: "on_track"
    },
    {
      id: 2,
      student: "Priya Verma",
      regNo: "22FE10CSE00234",
      title: "Recommendation System for E-learning",
      domain: "Data Science",
      progress: 45,
      startDate: "2024-10-01",
      status: "on_track"
    },
    {
      id: 3,
      student: "Karthik Menon",
      regNo: "21FE10CSE00087",
      title: "Automated Essay Grading using NLP",
      domain: "Machine Learning",
      progress: 90,
      startDate: "2024-08-20",
      status: "near_completion"
    }
  ];

  const studentPool = [
    {
      name: "Aditya Kumar",
      regNo: "23FE10CSE00445",
      year: "3rd Year",
      cgpa: "8.9",
      skills: ["Python", "TensorFlow", "Data Analysis"],
      interests: ["Machine Learning", "AI"],
      github: "github.com/adityakumar"
    },
    {
      name: "Meera Joshi",
      regNo: "24FE10CSE00112",
      year: "2nd Year",
      cgpa: "9.3",
      skills: ["Python", "Pandas", "SQL", "R"],
      interests: ["Data Science", "Statistics"],
      github: "github.com/meerajoshi"
    },
    {
      name: "Rohan Singh",
      regNo: "23FE10CSE00567",
      year: "3rd Year",
      cgpa: "8.5",
      skills: ["Python", "PyTorch", "OpenCV"],
      interests: ["Computer Vision", "Deep Learning"],
      github: "github.com/rohansingh"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'changes_requested': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
      case 'available': return 'text-green-700 bg-green-100';
      case 'limited slots': return 'text-yellow-700 bg-yellow-100';
      case 'full': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const filteredRequests = incomingRequests.filter(request => {
    const matchesSearch = request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesDomain = filterDomain === 'all' || request.project.domain === filterDomain;
    return matchesSearch && matchesStatus && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MentorConnect</h1>
                <p className="text-sm text-gray-500">Faculty Mentorship Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/teacher-profile')}
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all"
              >
                Edit Profile
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{mentorProfile.name}</p>
                  <p className="text-xs text-gray-500">{mentorProfile.designation}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {mentorProfile.name.split(' ').map(n => n[0]).join('')}
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
                <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {incomingRequests.filter(r => r.status === 'pending').length}
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
                <p className="text-sm text-gray-500 font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{activeProjects.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Capacity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {mentorProfile.currentProjects}/{mentorProfile.maxCapacity}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getCapacityColor(mentorProfile.capacity)}`}>
                  {mentorProfile.capacity.charAt(0).toUpperCase() + mentorProfile.capacity.slice(1)}
                </span>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Mentorship Profile</h2>
              <p className="text-sm text-gray-600 mb-4">{mentorProfile.statement}</p>
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
              <p className="text-sm text-gray-500 mb-2">Areas of Expertise</p>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.domains.map((domain, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Contact Information</p>
              <p className="text-sm text-gray-700">{mentorProfile.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Incoming Requests
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                  {incomingRequests.filter(r => r.status === 'pending').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Projects
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'students'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by student name or project title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Domains</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI">AI</option>
                </select>
              </div>

              {/* Request Cards */}
              <div className="space-y-6">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                          {request.student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{request.student.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)} flex items-center space-x-1`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{request.student.regNo} • {request.student.year} • CGPA: {request.student.cgpa}</p>
                          <p className="text-xs text-gray-400 mt-1">Submitted {request.daysAgo} days ago</p>
                        </div>
                      </div>
                    </div>

                    {/* Student Skills & Interests */}
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {request.student.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {request.student.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                              +{request.student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {request.student.interests.map((interest, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{request.project.title}</h4>
                        <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full">
                          {request.project.domain}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{request.project.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 font-medium mb-1">Methodology & Tech Stack</p>
                          <p className="text-gray-700">{request.project.methodology}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium mb-1">Expected Outcomes</p>
                          <p className="text-gray-700">{request.project.objectives}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section (if changes requested) */}
                    {request.status === 'changes_requested' && request.feedback && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-orange-900">Feedback Provided</p>
                            <p className="text-sm text-orange-700 mt-1">{request.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <a 
                        href={`https://${request.student.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View GitHub Profile</span>
                      </a>
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-1">
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>Request Changes</span>
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                        {request.status !== 'pending' && (
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Projects Tab */}
          {activeTab === 'active' && (
            <div className="p-6">
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            project.status === 'on_track' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {project.status === 'on_track' ? 'On Track' : 'Near Completion'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Student: <span className="font-medium">{project.student}</span> ({project.regNo})
                        </p>
                        <p className="text-xs text-gray-400">Domain: {project.domain} • Started: {new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        View Progress
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Pool Tab */}
          {activeTab === 'students' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Potential Students</h3>
                <p className="text-sm text-gray-600">Browse student profiles to find promising candidates for your research areas</p>
              </div>
              <div className="space-y-4">
                {studentPool.map((student, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.regNo} • {student.year} • CGPA: {student.cgpa}</p>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {student.skills.map((skill, skillIdx) => (
                                  <span key={skillIdx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1">Interests</p>
                              <div className="flex flex-wrap gap-1">
                                {student.interests.map((interest, interestIdx) => (
                                  <span key={interestIdx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <a 
                          href={`https://${student.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
                        >
                          View Profile
                        </a>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                          Send Invite
                        </button>
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