// filepath: /home/jordaneaster/phoenix/components/worksheets/WorksheetCard.js
import Link from 'next/link';
import { FiFileText, FiClipboard, FiUser, FiCalendar } from 'react-icons/fi';

export default function WorksheetCard({ worksheet, isManager }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'buyer_order':
        return <FiClipboard className="h-5 w-5 text-blue-500" />;
      case 'deal_pack':
        return <FiFileText className="h-5 w-5 text-green-500" />;
      default:
        return <FiFileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {getTypeIcon(worksheet.type)}
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                {worksheet.title}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {worksheet.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(worksheet.status)}`}>
            {worksheet.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          {worksheet.prospects && (
            <div className="flex items-center text-sm text-gray-600">
              <FiUser className="h-4 w-4 mr-2" />
              <span>{worksheet.prospects.name}</span>
            </div>
          )}
          
          {isManager && worksheet.users && (
            <div className="flex items-center text-sm text-gray-600">
              <FiUser className="h-4 w-4 mr-2" />
              <span>Created by: {worksheet.users.full_name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="h-4 w-4 mr-2" />
            <span>Created: {formatDate(worksheet.created_at)}</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <Link href={`/worksheets/${worksheet.id}`}>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View Details
            </button>
          </Link>
          
          <Link href={`/worksheets/${worksheet.id}/edit`}>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
              Edit
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}