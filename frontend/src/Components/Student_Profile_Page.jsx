import React, { useState, useEffect } from 'react';
import { User, Hash, Calendar, BookOpen, Award, Lightbulb, X, Plus, Github, Linkedin, Globe, Save, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    registration_no: '',
    year: '',
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
      const token = localStorage.getItem('authToken');
      const response = await axios.get("http://localhost:3000/user/student/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setFormData({
          registration_no: response.data.registration_no || '',
          year: response.data.year?.toString() || '',
          section: response.data.section || '',
          cgpa: response.data.cgpa?.toString() || '',
          skills: response.data.skills || [],
          interest: response.data.interest || [],
          github: response.data.github || '',
          linkedin: response.data.linkedin || '',
          portfolio: response.data.portfolio || ''
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        setErrorMessage('Failed to load profile data');
      }
    } finally {
      setLoading(false);
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
    if (!formData.registration_no || !formData.year) {
      setErrorMessage('Registration number and year are required fields');
      return;
    }

    if (formData.year < 1 || formData.year > 5) {
      setErrorMessage('Year must be between 1 and 5');
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
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        github: formData.github || undefined,
        linkedin: formData.linkedin || undefined,
        portfolio: formData.portfolio || undefined
      };

      await axios.put("http://localhost:3000/user/student/profile", payload, {
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
      setErrorMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8 px-4">
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

        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">Student Profile</h1>
                  <p className="text-blue-100">Manage your academic information</p>
                </div>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all flex items-center space-x-2 shadow-lg"
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
                      className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all flex items-center space-x-2 shadow-lg"
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
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start space-x-3 mb-6 animate-pulse">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">Success!</h3>
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Basic Information</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="registration_no" className="block text-sm font-medium text-gray-700">
                    Registration Number *
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="registration_no"
                        name="registration_no"
                        type="text"
                        value={formData.registration_no}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="23FE10CSE00534"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.registration_no || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Year *
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none bg-white"
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
                    <p className="text-gray-900 font-medium py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.year ? `${formData.year}${['st', 'nd', 'rd', 'th', 'th'][formData.year - 1]} Year` : 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                    Section
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="section"
                        name="section"
                        type="text"
                        value={formData.section}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="A"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.section || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="cgpa" className="block text-sm font-medium text-gray-700">
                    CGPA
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="cgpa"
                        name="cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="8.50"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.cgpa || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Lightbulb className="w-6 h-6 text-blue-600" />
                <span>Skills & Technologies</span>
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="e.g., JavaScript, Python, React"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[80px]">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Interests Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span>Areas of Interest</span>
              </h2>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="e.g., Machine Learning, Web Development"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addInterest}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                  {formData.interest.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                      {formData.interest.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="hover:bg-indigo-200 rounded-full p-0.5 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg min-h-[80px]">
                  {formData.interest.length > 0 ? (
                    formData.interest.map((interest, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No interests added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Social Links Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-blue-600" />
                <span>Social & Portfolio Links</span>
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                    GitHub Profile
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="github"
                        name="github"
                        type="url"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.github ? (
                        <a 
                          href={formData.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                        >
                          <Github className="w-4 h-4" />
                          <span>{formData.github}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.linkedin ? (
                        <a 
                          href={formData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>{formData.linkedin}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                    Portfolio / Personal Website
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  ) : (
                    <div className="py-3 px-4 bg-gray-50 rounded-lg">
                      {formData.portfolio ? (
                        <a 
                          href={formData.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                        >
                          <Globe className="w-4 h-4" />
                          <span>{formData.portfolio}</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 italic">Not set</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with action buttons when editing */}
          {isEditing && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
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
        </div>
      </div>
    </div>
  );
}