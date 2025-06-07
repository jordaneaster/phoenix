import './globals.css'; // Make sure this import is at the top
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Phoenix CRM',
  description: 'CRM system for car dealership sales teams',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
