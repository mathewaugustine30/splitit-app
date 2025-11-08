import React, { useState } from 'react';
import AuthLayout from './AuthLayout';

interface ForgotPasswordPageProps {
    onSwitchToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send an email here.
    // For this demo, we'll just show a success message.
    setSubmitted(true);
  };
    
  return (
    <AuthLayout title="Reset your password">
        {submitted ? (
            <div className="text-center">
                <p className="text-gray-700">If an account with that email exists, we've sent a password reset link to it.</p>
                <button onClick={onSwitchToLogin} className="mt-4 font-medium text-secondary hover:text-blue-500">
                    &larr; Back to login
                </button>
            </div>
        ) : (
            <>
                <p className="text-center text-sm text-gray-600 mb-4">Enter your email address and we will send you a link to reset your password.</p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    </div>

                    <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Send password reset email
                    </button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm">
                        Remembered your password?{' '}
                        <button onClick={onSwitchToLogin} className="font-medium text-secondary hover:text-blue-500">
                            Sign in
                        </button>
                    </p>
                </div>
            </>
        )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;