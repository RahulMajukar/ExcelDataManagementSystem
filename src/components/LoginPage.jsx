import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const StateStreetLogo = () => (
  <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="200" height="40" rx="5" fill="#05386B" />
    <text x="120" y="48" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">STATE STREET</text>
    <path d="M30 40 H55 M30 50 H45" stroke="white" strokeWidth="2" />
    <path d="M210 40 H185 M210 50 H195" stroke="white" strokeWidth="2" />
  </svg>
);

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const onSubmit = (data) => {
    // For demo purposes, hardcoded credentials
    // In real app, you'd check against stored credentials or API
    if (data.email === 'rahul@gmail.com' && data.password === 'admin@123') {
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', data.email);
      
      // Redirect to dashboard using React Router
      navigate('/dashboard');
    } else {
      setError('root', { 
        type: 'manual',
        message: 'Invalid credentials. Please try again.' 
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-md w-full space-y-8 backdrop-filter backdrop-blur-lg bg-white/80 p-10 rounded-xl shadow-xl border border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[200px] h-20 mb-4">
            <StateStreetLogo />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Excel Data Management System
          </p>
        </div>
        
        {errors.root && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{errors.root.message}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-3 pl-10 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition duration-150 ease-in-out`}
                  placeholder="your.email@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition duration-150 ease-in-out`}
                  placeholder="••••••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700 transition duration-150 ease-in-out">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
              </span>
              Sign in
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              By signing in, you agree to State Street's
              <a href="#" className="text-indigo-600 hover:text-indigo-700 ml-1">Terms of Service</a>
              <span className="mx-1">and</span>
              <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;