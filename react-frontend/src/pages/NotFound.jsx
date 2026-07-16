import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-soft mb-6">
        <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: '6s' }} />
      </div>
      
      <h1 className="font-display text-4xl font-extrabold text-slate-800 tracking-tight md:text-5xl">
        404
      </h1>
      
      <h2 className="font-display text-lg font-bold text-slate-700 mt-3">
        Page Not Found
      </h2>
      
      <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <div className="mt-8">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home} className="font-semibold text-sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
