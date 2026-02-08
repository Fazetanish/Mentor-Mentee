import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white dark:text-gray-100 text-xl font-bold mb-4">MentorMatch</h3>
            <p className="text-sm">Connecting students with expert mentors for meaningful academic collaboration.</p>
          </div>
          <div>
            <h4 className="text-white dark:text-gray-100 font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white dark:hover:text-gray-100 transition">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white dark:hover:text-gray-100 transition">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white dark:hover:text-gray-100 transition">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white dark:text-gray-100 font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-white dark:hover:text-gray-100 transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white dark:hover:text-gray-100 transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white dark:hover:text-gray-100 transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white dark:text-gray-100 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-white dark:hover:text-gray-100 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white dark:hover:text-gray-100 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 MentorMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;