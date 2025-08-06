import React from 'react';

const ProspectCard = ({ 
  prospect, 
  onView, 
  onEdit, 
  onScheduleFollowUp,
  onAssign 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hot':
        return 'bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded-full text-xs font-medium';
      case 'warm':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200 px-2 py-1 rounded-full text-xs font-medium';
      case 'cold':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded-full text-xs font-medium';
      case 'qualified':
        return 'bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded-full text-xs font-medium';
      case 'unqualified':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {getInitials(prospect.name)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {prospect.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={getStatusColor(prospect.status)}>
                  {prospect.status || 'New'}
                </span>
                {prospect.source && (
                  <span className="text-sm text-gray-500">
                    via {prospect.source}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onView?.(prospect)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(prospect)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="space-y-2">
            {prospect.email && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href={`mailto:${prospect.email}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {prospect.email}
                </a>
              </div>
            )}
            {prospect.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a 
                  href={`tel:${prospect.phone}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {prospect.phone}
                </a>
              </div>
            )}
            {prospect.assigned_to && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Assigned to {prospect.assigned_to_name || 'User'}</span>
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {prospect.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 line-clamp-2">
                {prospect.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              Created {formatTimeAgo(prospect.created_at)}
            </div>
            {prospect.updated_at !== prospect.created_at && (
              <div>
                Updated {formatTimeAgo(prospect.updated_at)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => onScheduleFollowUp?.(prospect)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Follow Up
            </button>
            <button
              onClick={() => onView?.(prospect)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectCard;
