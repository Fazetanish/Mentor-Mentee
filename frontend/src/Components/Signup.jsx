import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {z} from 'zod';

const requiredBody = z.object({
  fullName : z.string().min(2).max(50),
  email : z.email("Invalid email format").refine(
            (email) =>
                email.endsWith("@muj.manipal.edu") ||
                email.endsWith("@jaipur.manipal.edu"),
            "Email must be a valid Manipal University address"
            ),
  password : z.string().min(8).max(100),
  role : z.enum(["student" , "teacher"])
});

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Sign up attempted with:', formData);

    const result = requiredBody.safeParse({
      fullName : formData.fullName,
      email : formData.email,
      password : formData.password,
      role : formData.userType.toLowerCase()
    });

    if(!result.success){
      alert(result.error.issues[0].message);

      return;
    }

    const res = await axios.post("http://localhost:3000/user/signup" , {
      name : formData.fullName,
      email : formData.email,
      password : formData.password,
      role : formData.userType.toLowerCase()
    });

    alert(res.data.message);
    console.log(res.data.error);
    
    navigate('/student-profiles')
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    
    return { 
      strength, 
      label: labels[strength - 1] || '', 
      color: colors[strength - 1] || '' 
    };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-600">Sign up to get started</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= strength.strength ? strength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-600">Password strength: {strength.label}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'student' })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    formData.userType === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300 text-gray-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'teacher' })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    formData.userType === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-300 text-gray-700'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg"
            >
              Create Account
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button className="text-indigo-600 hover:text-indigo-700 font-medium transition">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}