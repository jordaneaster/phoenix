import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiBell, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = false;

export const dynamic = 'force-dynamic';

export default async function Notifications() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled (either in dev mode, via env var, or forced)
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values
  let notifications = [];
  let unreadCount = 0;
  
  // Only query Supabase if we have a session
  if (session) {
    // Get notifications for the user
    const { data: userNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (userNotifications) {
      notifications = userNotifications;
      unreadCount = userNotifications.filter(n => !n.read).length;
    }
  } 
  
  // Force mock notifications for all environments
  if (enableMockData && !session) {
    notifications = [
      {
        id: '1',
        title: 'Follow-up Required',
        message: 'Lead John Smith has not been contacted in over 3 days',
        type: 'follow_up',
        read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
        user_id: 'dev-user-id'
      },
      {
        id: '2',
        title: 'New Lead Assigned',
        message: 'You have been assigned a new lead: Jane Doe',
        type: 'lead_assigned',
        read: false,
        created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
        user_id: 'dev-user-id'
      },
      {
        id: '3',
        title: 'Training Reminder',
        message: 'New product training is available in the Training Center',
        type: 'training',
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString(), // two days ago
        user_id: 'dev-user-id'
      },
      {
        id: '4',
        title: 'Lead Status Updated',
        message: 'Lead Michael Brown has been marked as qualified',
        type: 'lead_update',
        read: true,
        created_at: new Date(Date.now() - 345600000).toISOString(), // four days ago
        user_id: 'dev-user-id'
      }
    ];
    
    unreadCount = notifications.filter(n => !n.read).length;
  }
  
  // Helper function for notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow_up':
        return <FiClock className="h-5 w-5 text-orange-500" />;
      case 'lead_assigned':
        return <FiInfo className="h-5 w-5 text-blue-500" />;
      case 'lead_update':
        return <FiInfo className="h-5 w-5 text-green-500" />;
      case 'training':
        return <FiCheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <FiBell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Helper function for notification date formatting
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        
        <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
          <FiBell className="inline-block mr-1" /> 
          {unreadCount} unread
        </div>
      </div>
      
      {!session && isDev && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock notification data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={notification.read ? 'bg-white' : 'bg-blue-50'}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-xs text-gray-500">
                            {formatNotificationDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      
                      <div className="mt-2 text-xs">
                        {notification.type === 'follow_up' && (
                          <Link 
                            href="/leads"
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            View Leads
                          </Link>
                        )}
                        
                        {notification.type === 'training' && (
                          <Link 
                            href="/training"
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            Go to Training
                          </Link>
                        )}
                        
                        {!notification.read && (
                          <button 
                            className="ml-4 text-gray-600 hover:text-gray-900 font-medium"
                            disabled={!session}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center">
            <FiBell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! Check back later for new notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
