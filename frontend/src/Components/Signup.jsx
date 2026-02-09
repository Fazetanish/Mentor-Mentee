import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, Loader2 } from 'lucide-react';
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
  
  // OTP verification states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset email verification if email is changed
    if (name === 'email') {
      setIsEmailVerified(false);
    }
  };

  // Send OTP function
  const handleSendOtp = async () => {
    // Validate email format first
    const emailValidation = z.string().email().refine(
      (email) => email.endsWith("@muj.manipal.edu") || email.endsWith("@jaipur.manipal.edu"),
      "Email must be a valid Manipal University address"
    );

    const result = emailValidation.safeParse(formData.email);
    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }

    setIsSendingOtp(true);
    try {
      await axios.post("http://localhost:3000/user/send-otp", {
        email: formData.email
      });
      
      setShowOtpModal(true);
      setOtpError('');
      setOtp(['', '', '', '', '', '']);
      
      // Start resend timer (60 seconds)
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP function
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    
    try {
      const response = await axios.post("http://localhost:3000/user/verify-otp", {
        email: formData.email,
        otp: otpString
      });

      if (response.data.verified) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    // Check if email is verified
    if (!isEmailVerified) {
      alert("Please verify your email first");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const result = requiredBody.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.userType.toLowerCase()
    });

    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }

    try {
      // 1️⃣ SIGNUP
      const signupRes = await axios.post(
        "http://localhost:3000/user/signup",
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.userType.toLowerCase()
        }
      );

      console.log("Signup success:", signupRes.data.message);

      // 2️⃣ AUTO SIGNIN
      const signinRes = await axios.post(
        "http://localhost:3000/user/signin",
        {
          email: formData.email,
          password: formData.password
        }
      );

      // 3️⃣ STORE TOKEN
      localStorage.setItem("authToken", signinRes.data.token);

      // 4️⃣ NAVIGATE
      const role = formData.userType.toLowerCase();

      if (role === "student") {
        navigate("/student-profiles");
      } else if (role === "teacher") {
        navigate("/teacher-profiles");
      }

    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
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
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign up to get started</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  className={`w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${isEmailVerified ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}`}
                  placeholder="you@muj.manipal.edu"
                />
                {isEmailVerified ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !formData.email}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition dark:text-gray-500 dark:hover:text-gray-300"
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
                          level <= strength.strength ? strength.color : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-600 dark:text-gray-300">Password strength: {strength.label}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition dark:text-gray-500 dark:hover:text-gray-300"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'student' })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    formData.userType === 'student'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-300 hover:border-indigo-300 text-gray-700 dark:border-gray-600 dark:hover:border-indigo-600 dark:text-gray-200'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'teacher' })}
                  className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                    formData.userType === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-300 hover:border-indigo-300 text-gray-700 dark:border-gray-600 dark:hover:border-indigo-600 dark:text-gray-200'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isEmailVerified}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all shadow-lg ${!isEmailVerified ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
            >
              Create Account
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <button className="text-indigo-600 hover:text-indigo-700 font-medium transition dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Verify Your Email</h2>
              <p className="text-gray-600 dark:text-gray-300">
                We've sent a 6-digit OTP to<br />
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{formData.email}</span>
              </p>
            </div>

            <div className="mt-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                ))}
              </div>

              {otpError && (
                <p className="mt-3 text-center text-red-500 text-sm">{otpError}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Didn't receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="text-indigo-600 hover:text-indigo-700 font-medium transition dark:text-indigo-400"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
              </div>

              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full mt-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}