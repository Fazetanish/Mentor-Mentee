import React, { useState } from 'react';
import { ArrowLeft, User, BookOpen, Code, Target, FileText, Upload, X, Check, AlertCircle, Plus } from 'lucide-react';

export default function ProjectRequestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  const availableMentors = [
    {
      id: 1,
      name: "Dr. Priya Mehta",
      designation: "Associate Professor",
      domains: ["Machine Learning", "Data Science", "AI"],
      capacity: "available",
      projects: 3,
      statement: "Looking for students interested in healthcare AI and predictive modeling. Strong Python and statistics background preferred.",
      email: "priya.mehta@college.edu"
    },
    {
      id: 2,
      name: "Prof. Rajesh Kumar",
      designation: "Assistant Professor",
      domains: ["Web Development", "Cloud Computing", "DevOps"],
      capacity: "limited",
      projects: 7,
      statement: "Focused on modern web architectures and scalable systems. Experience with React/Node.js is a plus.",
      email: "rajesh.kumar@college.edu"
    },
    {
      id: 3,
      name: "Dr. Ananya Singh",
      designation: "Professor",
      domains: ["Cybersecurity", "Blockchain", "Network Security"],
      capacity: "available",
      projects: 2,
      statement: "Interested in blockchain applications and cryptographic protocols. Looking for motivated students with strong problem-solving skills.",
      email: "ananya.singh@college.edu"
    }
  ];

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

  const handleSubmit = () => {
    if (validateStep(4)) {
      setShowSuccess(true);
      // Here you would normally send the data to your backend
      console.log('Submitting:', { mentor: selectedMentor, ...formData });
    }
  };

  const getCapacityBadge = (capacity) => {
    switch(capacity) {
      case 'available': return <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Available</span>;
      case 'limited': return <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">Limited Slots</span>;
      default: return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your project request has been sent to {selectedMentor.name}. You'll receive a notification once they review your proposal.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 mb-2">Next Steps:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monitor your dashboard for status updates</li>
              <li>• Check your email for notifications</li>
              <li>• Mentor typically responds within 3-5 days</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">New Project Request</h1>
                <p className="text-sm text-gray-500">Submit a detailed proposal to your chosen mentor</p>
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
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Select Mentor'}
                    {step === 2 && 'Project Details'}
                    {step === 3 && 'Methodology'}
                    {step === 4 && 'Goals & Timeline'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                    currentStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Select Mentor */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Mentor</h2>
              <p className="text-gray-600 mb-6">Choose a faculty member whose expertise aligns with your project interests</p>
              
              {errors.mentor && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{errors.mentor}</span>
                </div>
              )}

              <div className="space-y-4">
                {availableMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => setSelectedMentor(mentor)}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedMentor?.id === mentor.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
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
                        {selectedMentor?.id === mentor.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{mentor.statement}</p>
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

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
              <p className="text-gray-600 mb-6">Provide a clear and concise overview of your project idea</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    placeholder="e.g., AI-Powered Medical Diagnosis System"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.projectTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.projectTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.projectTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-2">
                      ({wordCounts.description}/150-200 words)
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project idea, the problem it solves, and why it's important..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: Include the problem statement, target users, and potential impact
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Methodology & Technology</h2>
              <p className="text-gray-600 mb-6">Explain your approach and the technologies you'll use</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Methodology <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-2">
                      ({wordCounts.methodology} words minimum 30)
                    </span>
                  </label>
                  <textarea
                    value={formData.methodology}
                    onChange={(e) => handleInputChange('methodology', e.target.value)}
                    placeholder="Describe your approach, algorithms, frameworks, and implementation strategy..."
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.methodology ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.methodology && (
                    <p className="mt-1 text-sm text-red-600">{errors.methodology}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: Break down your approach into phases or steps
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Technology Stack <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-2">
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
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    <p className="mt-3 text-sm text-gray-600">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Objectives & Timeline</h2>
              <p className="text-gray-600 mb-6">Define clear goals and expected outcomes</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Objectives <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-2">
                      ({wordCounts.objectives} words minimum 20)
                    </span>
                  </label>
                  <textarea
                    value={formData.objectives}
                    onChange={(e) => handleInputChange('objectives', e.target.value)}
                    placeholder="List specific, measurable goals for this project..."
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.objectives ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.objectives && (
                    <p className="mt-1 text-sm text-red-600">{errors.objectives}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Outcome <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-2">
                      ({wordCounts.expectedOutcome} words minimum 20)
                    </span>
                  </label>
                  <textarea
                    value={formData.expectedOutcome}
                    onChange={(e) => handleInputChange('expectedOutcome', e.target.value)}
                    placeholder="What will be the final deliverable? What impact do you expect?"
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.expectedOutcome ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expectedOutcome && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedOutcome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any other information you'd like to share with your mentor..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Summary Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Request Summary
                  </h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Mentor:</strong> {selectedMentor?.name}</p>
                    <p><strong>Project:</strong> {formData.projectTitle || 'Not specified'}</p>
                    <p><strong>Duration:</strong> {formData.duration || 'Not specified'}</p>
                    <p><strong>Technologies:</strong> {formData.techStack.length > 0 ? formData.techStack.join(', ') : 'None selected'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Submit Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}