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
      </body>
    </html>
  );
}
