import { Toaster } from 'react-hot-toast';
import Navbar from '../components/navigation/Navbar';
import '../styles/globals.css';

export const metadata = {
  title: 'Phoenix CRM',
  description: 'CRM system for automotive sales teams',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster position="top-right" />

        {/* Add error boundary for development feedback */}
        {process.env.NODE_ENV === 'development' && (
          <div
            id="dev-error-container"
            style={{ display: 'none' }}
            className="fixed bottom-0 left-0 right-0 bg-red-100 text-red-800 p-4 border-t border-red-200"
          >
            <p className="font-medium">Error:</p>
            <pre
              id="dev-error-message"
              className="mt-2 text-sm overflow-auto max-h-32"
            ></pre>
          </div>
        )}
      </body>
    </html>
  );
}
