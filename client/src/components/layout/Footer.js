import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <i className="fas fa-graduation-cap text-2xl text-blue-500"></i>
              <span className="text-xl font-bold">EduPlatform</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering learners worldwide with quality education and
              professional development opportunities.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses?category=programming"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Programming
                </Link>
              </li>
              <li>
                <Link
                  to="/courses?category=design"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Design
                </Link>
              </li>
              <li>
                <Link
                  to="/courses?category=business"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  to="/courses?category=marketing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Marketing
                </Link>
              </li>
              <li>
                <Link
                  to="/courses?category=photography"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Photography
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1.5 mr-3 text-blue-500"></i>
                <span className="text-gray-400">
                  123 Learning Street
                  <br />
                  Education City, ED 12345
                </span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-blue-500"></i>
                <a
                  href="tel:+1234567890"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-blue-500"></i>
                <a
                  href="mailto:info@eduplatform.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  info@eduplatform.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} EduPlatform. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
