import Navbar from '../../components/navigation/Navbar';

// TEMPORARY: Simplified layout without auth checks
export default function DashboardLayout({ children }) {
  // Mock user for development
  const mockUser = {
    id: 'dev-user-id',
    email: 'dev@example.com',
  };
  
  // Mock notifications
  const mockNotifications = [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} notifications={mockNotifications} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
        Development Mode: Authentication bypassed temporarily
      </div>
    </div>
  );
}
