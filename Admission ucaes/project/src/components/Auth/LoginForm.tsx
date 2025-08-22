import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiLoader, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import ucesLogo from '../../images/uceslogo.png';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        // Login successful - user will be automatically logged in
        console.log('Login successful!');
      }
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="form">
        <div>
          <div className="flex justify-center mb-4">
            <img src={ucesLogo} alt="UCAES Logo" className="h-20 w-20" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to UCAES
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your admissions portal
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter your password"
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
                   <FiLogIn className="h-5 w-5 mr-2" />
                   Sign in
                 </>
               )}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="p">
              Don't have an account?{' '}
              <Link to="/register" className="span">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;