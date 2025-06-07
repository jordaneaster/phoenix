'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiUser, FiLock } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [createTestUser, setCreateTestUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Email validation helper
  const isValidEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Use Supabase directly - no API call that might return HTML
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast.success('Login successful!');
      
      // Use a more direct approach for navigation
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    setLoading(true);
    setErrorMessage('');
    
    // Force the email to use example.com domain
    let safeEmail = email;
    if (!safeEmail.endsWith('@example.com')) {
      // Extract username or create one
      const username = safeEmail.includes('@') 
        ? safeEmail.split('@')[0] 
        : safeEmail.replace(/[^a-zA-Z0-9]/g, '');
      
      safeEmail = `${username}@example.com`;
      toast.info(`Using ${safeEmail} for test account`);
    }

    try {
      console.log('Creating test user with email:', safeEmail);
      
      // Create a test user with the provided email/password
      const { data, error } = await supabase.auth.signUp({
        email: safeEmail,
        password: password.length >= 6 ? password : password + '123456'.substring(0, 6 - password.length),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      // For development purposes, we'll auto-confirm the user
      console.log('User created:', data.user?.id);
      
      // Create a profile for the test user
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: `Test User (${safeEmail.split('@')[0]})`,
          role: 'manager', // Make test user a manager for full access
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast.success('Test user created! Signing you in...');
        
        // Automatically sign in with the new credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: safeEmail,
          password: password.length >= 6 ? password : password + '123456'.substring(0, 6 - password.length),
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError);
          throw signInError;
        }
        
        // Force direct navigation to dashboard
        toast.success('Login successful!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      setErrorMessage(`Failed to create test user: ${error.message || 'Unknown error'}`);
      toast.error('Failed to create test user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">Phoenix CRM</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                minLength="6"
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading || !email || password.length < 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        {!createTestUser ? (
          <div className="text-center">
            <button
              onClick={() => setCreateTestUser(true)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Create test account for development
            </button>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-900">Create Test User</h3>
            <p className="mt-1 text-xs text-gray-500">
              This will create a test user with an @example.com email address.
            </p>
            <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-xs rounded">
              Note: We'll automatically convert your email to use the example.com domain
              for testing purposes.
            </div>
            <div className="mt-3 flex justify-between">
              <button
                onClick={() => setCreateTestUser(false)}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTestUser}
                disabled={loading || !email || password.length < 6}
                className="ml-3 inline-flex justify-center py-2 px-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Test User'}
              </button>
            </div>
          </div>
        )}
        
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>Use the "Create test account" option if you haven't set up users yet.</p>
          <p className="mt-1">Try using an email like "test@example.com" for best results.</p>
        </div>
      </div>
    </div>
  );
}
