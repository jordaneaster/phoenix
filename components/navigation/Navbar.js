'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { FiMenu, FiX, FiBell, FiUser } from 'react-icons/fi';

export default function Navbar({ user, notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold text-primary-600">Phoenix CRM</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Dashboard
            </Link>
            <Link href="/leads" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/leads' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Leads
            </Link>
            <Link href="/follow-ups" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/follow-ups' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Follow-Ups
            </Link>
            <Link href="/training" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/training' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Training
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center">
            <Link href="/notifications" className="p-2 rounded-full text-gray-700 hover:bg-gray-100 relative">
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile" className="ml-3 p-2 rounded-full text-gray-700 hover:bg-gray-100">
              <FiUser className="h-5 w-5" />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Dashboard
            </Link>
            <Link href="/leads" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/leads' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Leads
            </Link>
            <Link href="/follow-ups" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/follow-ups' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Follow-Ups
            </Link>
            <Link href="/training" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/training' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Training
            </Link>
            <Link href="/notifications" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/notifications' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Link>
            <Link href="/profile" className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/profile' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}>
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
