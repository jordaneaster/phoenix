'use client';

import Link from 'next/link';
import { FiClock, FiUser, FiMail, FiPhone, FiCheck, FiEdit, FiAlertTriangle } from 'react-icons/fi';

export default function FollowUpCard({ followUp, isManager }) {
  const now = new Date();
  const dueDate = new Date(followUp.due_date);
  const isOverdue = dueDate < now && !followUp.completed;
  const isDueToday = dueDate.toDateString() === now.toDateString();
  
  // Priority colors
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };
  
  // Format due date
  const formatDueDate = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays === -1) return 'Due Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `Due in ${diffDays} days`;
  };
  
  const handleComplete = async () => {
    // TODO: Implement completion logic
    console.log('Complete follow-up:', followUp.id);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
      isOverdue ? 'border-l-red-500' : 
      isDueToday ? 'border-l-yellow-500' : 
      followUp.completed ? 'border-l-green-500' : 'border-l-blue-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`text-lg font-medium ${
              followUp.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {followUp.title}
            </h3>
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              priorityColors[followUp.priority]
            }`}>
              {followUp.priority.toUpperCase()}
            </span>
            
            {followUp.completed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <FiCheck className="w-3 h-3 mr-1" />
                Completed
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{followUp.description}</p>
          
          {/* Prospect Information */}
          {followUp.prospects && (
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-1" />
                  <span className="font-medium">{followUp.prospects.name}</span>
                </div>
                {followUp.prospects.email && (
                  <div className="flex items-center">
                    <FiMail className="w-4 h-4 mr-1" />
                    <a href={`mailto:${followUp.prospects.email}`} className="text-blue-600 hover:text-blue-800">
                      {followUp.prospects.email}
                    </a>
                  </div>
                )}
                {followUp.prospects.phone && (
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-1" />
                    <a href={`tel:${followUp.prospects.phone}`} className="text-blue-600 hover:text-blue-800">
                      {followUp.prospects.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Due Date and Assignment */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${
                isOverdue ? 'text-red-600' : isDueToday ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {isOverdue ? (
                  <FiAlertTriangle className="w-4 h-4 mr-1" />
                ) : (
                  <FiClock className="w-4 h-4 mr-1" />
                )}
                <span className="font-medium">{formatDueDate(dueDate)}</span>
              </div>
              
              {followUp.users && (
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-1" />
                  <span>Assigned to: {followUp.users.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          {!followUp.completed && (
            <button
              onClick={handleComplete}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiCheck className="w-3 h-3 mr-1" />
              Complete
            </button>
          )}
          
          {isManager && (
            <Link href={`/follow-up/${followUp.id}/edit`}>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <FiEdit className="w-3 h-3 mr-1" />
                Edit
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
