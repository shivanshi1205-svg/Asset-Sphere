import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center md:flex md:items-center md:justify-between">
      <p className="text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Asset Sphere. All rights reserved.
      </p>
      <div className="mt-2 md:mt-0 flex justify-center gap-4 text-xs text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
        <span>&middot;</span>
        <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
        <span>&middot;</span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
