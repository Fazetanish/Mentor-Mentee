import { useState } from 'react';
import { User, Briefcase, Users, Lightbulb, Award, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function TeacherProfileForm() {
  const [formData, setFormData] = useState({
    designation: '',
    capacity: 'available',
    skills: [],
    interest: []
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    // Validation
    if (!formData.capacity) {
      setErrorMessage('Capacity is a required field');
      return;
    }

    try {
      console.log('Teacher profile data:', formData);
      const token = localStorage.getItem('authToken');
      const res = await axios.post("http://localhost:3000/user/teacher/profile", {
        ...formData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccessMessage('Teacher profile created successfully!');
      navigate("/teacher-landing-page");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const getCapacityColor = (capacity) => {
    switch(capacity) {
      case 'available':
        return 'text-green-600';
      case 'limited slots':
        return 'text-yellow-600';
      case 'full':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-2">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Profile</h1>
            <p className="text-gray-600">Set up your teaching profile</p>
          </div>

          <div className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start space-x-3 animate-pulse">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">Success!</h3>
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start space-x-3">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Associate Professor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition appearance-none bg-white ${getCapacityColor(formData.capacity)}`}
                  >
                    <option value="available" className="text-green-600">Available</option>
                    <option value="limited slots" className="text-yellow-600">Limited Slots</option>
                    <option value="full" className="text-red-600">Full</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.capacity === 'available' && '✓ Accepting new students'}
                  {formData.capacity === 'limited slots' && '⚠ Few slots remaining'}
                  {formData.capacity === 'full' && '✗ Not accepting new students'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Machine Learning, Data Science"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:bg-emerald-200 rounded-full p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Research Interests
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lightbulb className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={currentInterest}
                    onChange={(e) => setCurrentInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Natural Language Processing, Computer Vision"
                  />
                </div>
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              {formData.interest.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interest.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:bg-teal-200 rounded-full p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all shadow-lg"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}