import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-400">404</h1>
        <h2 className="text-3xl font-semibold text-white mt-4">Page Not Found</h2>
        <p className="text-slate-400 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;