import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/loader';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, fullName);
      
      if (result.success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Handle specific Firebase errors
        switch (result.code) {
          case 'auth/email-already-in-use':
            setError('Email already in use. Please use a different email.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address.');
            break;
          case 'auth/weak-password':
            setError('Password is too weak. Please use a stronger password.');
            break;
          default:
            setError(result.error || 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your TruthShield account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-700/50 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-900/30 backdrop-blur-sm border border-emerald-700/50 text-emerald-300 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            
            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
            />
            
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader size="small" /> : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;