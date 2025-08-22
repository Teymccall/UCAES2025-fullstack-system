import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiLoader, FiUser, FiMail, FiLock, FiUserCheck } from 'react-icons/fi';
import ucesLogo from '../../images/uceslogo.png';

const RegisterForm: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await register(formData.email, formData.password, formData.name);
      // Let the auth state listener handle navigation naturally
      // The AppContent component will redirect to dashboard automatically
      console.log('Registration initiated - waiting for auth state change...');
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="form">
        <div>
          <div className="flex justify-center mb-4">
            <img src={ucesLogo} alt="UCAES Logo" className="h-20 w-20" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your UCAES account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your university application journey
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="name" className="flex-column">
                Full Name
              </label>
              <div className="inputForm">
                <FiUser className="h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="flex-column">
                Email address
              </label>
              <div className="inputForm">
                <FiMail className="h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="flex-column">
                Password
              </label>
              <div className="inputForm">
                <FiLock className="h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="flex-column">
                Confirm Password
              </label>
              <div className="inputForm">
                <FiUserCheck className="h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center py-2">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="button-submit"
            >
              {isLoading ? (
                <FiLoader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FiUserCheck className="h-5 w-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="p">
              Already have an account?{' '}
              <Link to="/login" className="span">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;