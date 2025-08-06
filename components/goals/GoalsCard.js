export default function GoalsCard({ goal, onEdit, onDelete, onUpdateProgress }) {
  const progressPercentage = Math.min(100, (goal.progress / goal.target_value) * 100);
  
  const formatGoalType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-600';
    if (percentage >= 75) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatGoalType(goal.goal_type)}
          </h3>
          <p className="text-sm text-gray-600">
            Target: {goal.target_value}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(goal)}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
          </button>
          <button 
            onClick={() => onDelete(goal.id)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{goal.progress}/{goal.target_value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {formatDate(goal.deadline)}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onUpdateProgress(goal.id, goal.progress + 1)}
            className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs hover:bg-green-200 transition-colors"
          >
            +1
          </button>
          {goal.progress > 0 && (
            <button 
              onClick={() => onUpdateProgress(goal.id, goal.progress - 1)}
              className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
            >
              -1
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Created {new Date(goal.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
