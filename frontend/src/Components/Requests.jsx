import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, BookOpen, Code, Target, FileText, Upload, X, Check, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export default function ProjectRequestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for mentors from backend
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  
  const [formData, setFormData] = useState({
    projectTitle: '',
    description: '',
    methodology: '',
    techStack: [],
    objectives: '',
    expectedOutcome: '',
    duration: '',
    teamSize: '1',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [wordCounts, setWordCounts] = useState({
    description: 0,
    methodology: 0,
    objectives: 0,
    expectedOutcome: 0
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch available mentors from backend
  const fetchMentors = async () => {
    try {
      setLoadingMentors(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/teacher/mentors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.mentors) {
        const formattedMentors = response.data.mentors
          .filter(mentor => mentor.capacity !== 'full') // Only show mentors who can accept requests
          .map(mentor => ({
            id: mentor.user_id?._id || mentor._id,
            name: mentor.user_id?.name || 'Unknown',
            designation: mentor.designation || 'Faculty',
            domains: [...(mentor.skills || []), ...(mentor.interest || [])],
            capacity: mapCapacity(mentor.capacity),
            projects: mentor.currentProjects || 0,
            statement: mentor.statement || `Expert in ${(mentor.skills || []).join(', ')}. Looking for motivated students.`,
            email: mentor.user_id?.email || ''
          }));
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

  // Fetch mentors on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/signin');
      return;
    }
    
    fetchMentors();
    
    // Check if a mentor was pre-selected from the landing page
    if (location.state?.selectedMentor) {
      setSelectedMentor(location.state.selectedMentor);
    }
  }, [navigate, location.state]);

  const techStackOptions = [
    "Python", "JavaScript", "React", "Node.js", "Django", "Flask",
    "TensorFlow", "PyTorch", "MongoDB", "PostgreSQL", "MySQL",
    "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
    "React Native", "Flutter", "Java", "C++", "Solidity"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update word count for text areas
    if (['description', 'methodology', 'objectives', 'expectedOutcome'].includes(field)) {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCounts(prev => ({ ...prev, [field]: words.length }));
    }
  };

  const toggleTechStack = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!selectedMentor) {
        newErrors.mentor = "Please select a mentor";
      }
    }

    if (step === 2) {
      if (!formData.projectTitle.trim()) {
        newErrors.projectTitle = "Project title is required";
      }
      if (wordCounts.description < 50) {
        newErrors.description = "Description must be at least 50 words";
      }
      if (wordCounts.description > 200) {
        newErrors.description = "Description must not exceed 200 words";
      }
    }

    if (step === 3) {
      if (wordCounts.methodology < 30) {
        newErrors.methodology = "Methodology must be at least 30 words";
      }
      if (formData.techStack.length === 0) {
        newErrors.techStack = "Please select at least one technology";
      }
    }

    if (step === 4) {
      if (wordCounts.objectives < 20) {
        newErrors.objectives = "Objectives must be at least 20 words";
      }
      if (wordCounts.expectedOutcome < 20) {
        newErrors.expectedOutcome = "Expected outcome must be at least 20 words";
      }
      if (!formData.duration) {
        newErrors.duration = "Please select project duration";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = getAuthToken();
      const requestData = {
        mentor_id: selectedMentor.id,
        projectTitle: formData.projectTitle,
        description: formData.description,
        teamSize: formData.teamSize,
        methodology: formData.methodology,
        techStack: formData.techStack,
        objectives: formData.objectives,
        expectedOutcome: formData.expectedOutcome,
        duration: formData.duration,
        additionalNotes: formData.additionalNotes
      };

      const response = await axios.post(`${API_BASE_URL}/project/request`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.requestId) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitError(
        error.response?.data?.message || 
        'Failed to submit request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCapacityBadge = (capacity) => {
    switch(capacity) {
      case 'available': return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 rounded-full">Available</span>;
      case 'limited': return <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full">Limited Slots</span>;
      default: return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your project request has been sent to {selectedMentor.name}. You'll receive a notification once they review your proposal.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Next Steps:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Monitor your dashboard for status updates</li>
              <li>• Check your email for notifications</li>
              <li>• Mentor typically responds within 3-5 days</li>
            </ul>
          </div>
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Project Request</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submit a detailed proposal to your chosen mentor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step === 1 && 'Select Mentor'}
                    {step === 2 && 'Project Details'}
                    {step === 3 && 'Methodology'}
                    {step === 4 && 'Goals & Timeline'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          {/* Step 1: Select Mentor */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select Your Mentor</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Choose a faculty member whose expertise aligns with your project interests</p>
              
              {errors.mentor && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700 dark:text-red-300">{errors.mentor}</span>
                </div>
              )}

              {loadingMentors ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : availableMentors.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No mentors available at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      onClick={() => setSelectedMentor(mentor)}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        selectedMentor?.id === mentor.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {mentor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{mentor.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.designation}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Currently mentoring {mentor.projects} projects</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getCapacityBadge(mentor.capacity)}
                          {selectedMentor?.id === mentor.id && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">{mentor.statement}</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.domains.map((domain, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
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

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Project Details</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Provide a clear and concise overview of your project idea</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="e.g., AI-Powered Medical Diagnosis System"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.projectTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.projectTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Project Description <span className="text-red-500">*</span>
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      ({wordCounts.description}/50-200 words)
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project idea, the problem it solves, and why it's important..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Tip: Include the problem statement, target users, and potential impact
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="1">Individual Project</option>
                    <option value="2">2 Members</option>
                    <option value="3">3 Members</option>
                    <option value="4">4 Members</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Methodology & Tech Stack */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Methodology & Technology</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Explain your approach and the technologies you'll use</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Proposed Methodology <span className="text-red-500">*</span>
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      ({wordCounts.methodology} words, minimum 30)
                    </span>
                  </label>
                  <textarea
                    value={formData.methodology}
                    onChange={(e) => handleInputChange('methodology', e.target.value)}
                    placeholder="Describe your approach, algorithms, frameworks, and implementation strategy..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.methodology ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.methodology && (
                    <p className="mt-1 text-sm text-red-600">{errors.methodology}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Tip: Break down your approach into phases or steps
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Technology Stack <span className="text-red-500">*</span>
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      (Select all that apply)
                    </span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {techStackOptions.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTechStack(tech)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          formData.techStack.includes(tech)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                  {errors.techStack && (
                    <p className="mt-2 text-sm text-red-600">{errors.techStack}</p>
                  )}
                  {formData.techStack.length > 0 && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      Selected: {formData.techStack.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goals & Timeline */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Objectives & Timeline</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Define clear goals and expected outcomes</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Project Objectives <span className="text-red-500">*</span>
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      ({wordCounts.objectives} words, minimum 20)
                    </span>
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                    placeholder="List specific, measurable goals for this project..."
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.objectives ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.objectives && (
                    <p className="mt-1 text-sm text-red-600">{errors.objectives}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Expected Outcome <span className="text-red-500">*</span>
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                      ({wordCounts.expectedOutcome} words, minimum 20)
                    </span>
                  </label>
                  <textarea
                    value={formData.expectedOutcome}
                    onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                    placeholder="What will be the final deliverable? What impact do you expect?"
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.expectedOutcome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.expectedOutcome && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedOutcome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Project Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select duration</option>
                    <option value="1-2 months">1-2 months (Summer Project)</option>
                    <option value="3-4 months">3-4 months (Semester Project)</option>
                    <option value="6 months">6 months (Major Project)</option>
                    <option value="1 year">1 year (B.Tech Project)</option>
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any other information you'd like to share with your mentor..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Summary Box */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Request Summary
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
                    <p><strong>Mentor:</strong> {selectedMentor?.name}</p>
                    <p><strong>Project:</strong> {formData.projectTitle || 'Not specified'}</p>
                    <p><strong>Duration:</strong> {formData.duration || 'Not specified'}</p>
                    <p><strong>Technologies:</strong> {formData.techStack.length > 0 ? formData.techStack.join(', ') : 'None selected'}</p>
                  </div>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700 dark:text-red-300">{submitError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Back
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}