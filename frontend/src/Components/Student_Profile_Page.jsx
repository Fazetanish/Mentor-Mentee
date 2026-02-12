import React, { useState, useEffect } from 'react';
import { User, Hash, Calendar, BookOpen, Award, Lightbulb, X, Plus, Github, Linkedin, Globe, Save, Edit3, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    registration_no: '',
    year: '',
    semester: '',
    section: '',
    cgpa: '',
    skills: [],
    interest: [],
    github: '',
    linkedin: '',
    portfolio: ''
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  // Fetch existing profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrorMessage('Authentication required. Please log in.');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/user/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Backend returns data in response.data.profile
      if (response.data && response.data.profile) {
        const profile = response.data.profile;
        
        // Extract user info from populated user_id
        if (profile.user_id) {
          setStudentName(profile.user_id.name || '');
          setStudentEmail(profile.user_id.email || '');
        }
        
        setFormData({
          registration_no: profile.registration_no || '',
          year: profile.year?.toString() || '',
          semester: profile.semester?.toString() || '',
          section: profile.section || '',
          cgpa: profile.cgpa?.toString() || '',
          skills: profile.skills || [],
          interest: profile.interest || [],
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          portfolio: profile.portfolio || ''
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setErrorMessage('Access denied. Only students can view this page.');
      } else if (error.response?.status !== 404) {
        setErrorMessage('Failed to load profile data. Please try again.');
      }
      // 404 means profile not found - user needs to create one, so we don't show error
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const token = localStorage.getItem('authToken');
      
      // Optional: Call backend logout endpoint to invalidate token
      if (token) {
        try {
          await axios.post(`${API_BASE_URL}/user/logout`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (err) {
          // Even if backend logout fails, we still clear local storage
          console.log('Backend logout call failed, proceeding with local logout');
        }
      }
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      
      // Clear any session storage as well
      sessionStorage.clear();
      
      // Redirect to login page
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local storage and redirect
      localStorage.removeItem('authToken');
      navigate('/signin', { replace: true });
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addInterest = () => {
    if (currentInterest.trim() && !formData.interest.includes(currentInterest.trim())) {
      setFormData({
        ...formData,
        interest: [...formData.interest, currentInterest.trim()]
      });
      setCurrentInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData({
      ...formData,
      interest: formData.interest.filter(interest => interest !== interestToRemove)
    });
  };

  const validateURL = (url, type) => {
    if (!url) return true; // Empty is valid
    
    const patterns = {
      github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/,
      portfolio: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    };
    
    return patterns[type].test(url);
  };

  const handleSubmit = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    // Validation
    if (!formData.registration_no || !formData.year || !formData.semester) {
      setErrorMessage('Registration number, year, and semester are required fields');
      return;
    }

    if (formData.year < 1 || formData.year > 5) {
      setErrorMessage('Year must be between 1 and 5');
      return;
    }

    if (formData.semester < 1 || formData.semester > 10) {
      setErrorMessage('Semester must be between 1 and 10');
      return;
    }

    if (formData.cgpa && (formData.cgpa < 0 || formData.cgpa > 10)) {
      setErrorMessage('CGPA must be between 0 and 10');
      return;
    }

    // Validate URLs
    if (formData.github && !validateURL(formData.github, 'github')) {
      setErrorMessage('Invalid GitHub URL format');
      return;
    }

    if (formData.linkedin && !validateURL(formData.linkedin, 'linkedin')) {
      setErrorMessage('Invalid LinkedIn URL format');
      return;
    }

    if (formData.portfolio && !validateURL(formData.portfolio, 'portfolio')) {
      setErrorMessage('Invalid portfolio URL format');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrorMessage('Authentication required. Please log in.');
        navigate('/login');
        return;
      }

      const payload = {
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        section: formData.section || undefined,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        skills: formData.skills,
        interest: formData.interest,
        github: formData.github || undefined,
        linkedin: formData.linkedin || undefined,
        portfolio: formData.portfolio || undefined
      };

      // Use PATCH endpoint as defined in backend
      await axios.patch(`${API_BASE_URL}/user/student/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      setTimeout(() => {
        fetchProfile();
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setErrorMessage('Profile not found. Please create a profile first.');
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-8 px-4">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to log out? You will need to sign in again to access your profile.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={loggingOut}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
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

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{studentName || 'Student Profile'}</h1>
                  <p className="text-blue-100">{studentEmail || 'Manage your academic information'}</p>
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-white dark:bg-gray-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-300 transition-all flex items-center space-x-2 shadow-lg"
                  >
                    <Edit3 className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                        setSuccessMessage('');
                        setErrorMessage('');
                      }}
                      className="px-4 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-white dark:bg-gray-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-300 transition-all flex items-center space-x-2 shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="px-8 pt-6">
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded-lg p-4 flex items-start space-x-3 mb-6 animate-pulse">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Success!</h3>
                  <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                  <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Basic Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Number */}
                <div className="space-y-2">
                  <label htmlFor="registration_no" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Registration Number *
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="registration_no"
                        name="registration_no"
                        type="text"
                        value={formData.registration_no}
                        onChange={handleChange}
                        disabled={true}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-gray-100 dark:bg-gray-600 dark:text-gray-100 cursor-not-allowed"
                        placeholder="23FE10CSE00534"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.registration_no || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Year *
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.year ? `${formData.year}${['st', 'nd', 'rd', 'th', 'th'][formData.year - 1]} Year` : 'Not set'}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div className="space-y-2">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Semester *
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.semester ? `Semester ${formData.semester}` : 'Not set'}
                    </p>
                  )}
                </div>

                {/* Section */}
                <div className="space-y-2">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Section
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="section"
                        name="section"
                        type="text"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="A"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.section || 'Not set'}
                    </p>
                  )}
                </div>

                {/* CGPA */}
                <div className="space-y-2">
                  <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    CGPA
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="cgpa"
                        name="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="8.50"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 font-medium py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.cgpa || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Skills & Technologies</span>
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="e.g., JavaScript, Python, React"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[80px]">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Areas of Interest</span>
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="e.g., Machine Learning, Web Development"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                  {formData.interest.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.interest.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="hover:bg-indigo-200 dark:hover:bg-indigo-800/50 rounded-full p-0.5 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-[80px]">
                  {formData.interest.length > 0 ? (
                    formData.interest.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Social Links Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span>Social & Portfolio Links</span>
              </h2>
              <div className="space-y-4">
                {/* GitHub */}
                <div className="space-y-2">
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    GitHub Profile
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="github"
                        name="github"
                        type="url"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.github ? (
                        <a 
                          href={formData.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
                        >
                          <Github className="w-4 h-4" />
                          <span>{formData.github}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    LinkedIn Profile
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.linkedin ? (
                        <a 
                          href={formData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>{formData.linkedin}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="space-y-2">
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Portfolio / Personal Website
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:text-gray-100"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {formData.portfolio ? (
                        <a 
                          href={formData.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>{formData.portfolio}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with action buttons when editing */}
          {isEditing && (
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                  className="px-6 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Logout Section */}
          {!isEditing && (
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Signed in as <span className="font-medium">{studentEmail}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Need to switch accounts? Log out and sign in with a different account.
                  </p>
                </div>
                <button
                onClick={() => setShowLogoutModal(true)}
                className="px-6 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium flex items-center space-x-2 cursor-pointer hover:scale-105 active:scale-95"
                >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}