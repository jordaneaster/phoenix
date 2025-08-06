'use client';

import { useState, useEffect } from 'react';
import ManagerCard from '../../components/manager/ManagerCard';

export default function ManagerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamMembers, setTeamMembers] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [accountabilityLogs, setAccountabilityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAccountabilityForm, setShowAccountabilityForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states
  const [reviewFormData, setReviewFormData] = useState({
    review_date: new Date().toISOString().split('T')[0],
    notes: '',
    action_items: ''
  });

  const [accountabilityFormData, setAccountabilityFormData] = useState({
    activity_type: '',
    remarks: ''
  });

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const [teamResponse, reviewsResponse, logsResponse] = await Promise.all([
        fetch('/api/manager/team'),
        fetch('/api/manager/reviews'),
        fetch('/api/manager/accountability')
      ]);

      const [team, reviews, logs] = await Promise.all([
        teamResponse.json(),
        reviewsResponse.json(),
        logsResponse.json()
      ]);

      setTeamMembers(team);
      setRecentReviews(reviews);
      setAccountabilityLogs(logs);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReview = (member) => {
    setSelectedMember(member);
    setShowReviewForm(true);
  };

  const handleNewAccountability = (member) => {
    setSelectedMember(member);
    setShowAccountabilityForm(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/manager/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reviewFormData,
          user_id: selectedMember.id
        }),
      });

      if (response.ok) {
        await fetchManagerData();
        setShowReviewForm(false);
        setSelectedMember(null);
        setReviewFormData({
          review_date: new Date().toISOString().split('T')[0],
          notes: '',
          action_items: ''
        });
      }
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleSubmitAccountability = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/manager/accountability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...accountabilityFormData,
          team_member_id: selectedMember.id,
          activity_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        await fetchManagerData();
        setShowAccountabilityForm(false);
        setSelectedMember(null);
        setAccountabilityFormData({
          activity_type: '',
          remarks: ''
        });
      }
    } catch (error) {
      console.error('Error saving accountability log:', error);
    }
  };

  const cancelForms = () => {
    setShowReviewForm(false);
    setShowAccountabilityForm(false);
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your team and track accountability</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'team', label: 'Team Management' },
            { key: 'reviews', label: 'Reviews' },
            { key: 'accountability', label: 'Accountability' }
          ].map((tab) => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ManagerCard 
            title="Team Size"
            value={teamMembers.length}
            color="blue"
          />
          <ManagerCard 
            title="Recent Reviews"
            value={recentReviews.length}
            color="green"
          />
          <ManagerCard 
            title="Accountability Logs"
            value={accountabilityLogs.length}
            color="purple"
          />
        </div>
      )}

      {activeTab === 'team' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{member.full_name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-400">
                    {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)} • {member.department?.charAt(0).toUpperCase() + member.department?.slice(1)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleNewReview(member)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs hover:bg-blue-200"
                  >
                    New Review
                  </button>
                  <button 
                    onClick={() => handleNewAccountability(member)}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs hover:bg-green-200"
                  >
                    Log Activity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentReviews.map((review) => (
              <div key={review.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{review.user?.full_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{review.notes}</p>
                    {review.action_items && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">Action Items:</p>
                        <p className="text-xs text-gray-600">{review.action_items}</p>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.review_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'accountability' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Accountability Logs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {accountabilityLogs.map((log) => (
              <div key={log.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{log.team_member?.full_name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{log.activity_type?.charAt(0).toUpperCase() + log.activity_type?.slice(1)}</p>
                    {log.remarks && (
                      <p className="text-sm text-gray-600 mt-1">{log.remarks}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.activity_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Review for {selectedMember?.full_name}</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                  <input 
                    type="date" 
                    value={reviewFormData.review_date}
                    onChange={(e) => setReviewFormData({...reviewFormData, review_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    value={reviewFormData.notes}
                    onChange={(e) => setReviewFormData({...reviewFormData, notes: e.target.value})}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Review notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Items</label>
                  <textarea 
                    value={reviewFormData.action_items}
                    onChange={(e) => setReviewFormData({...reviewFormData, action_items: e.target.value})}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Action items and next steps..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={cancelForms}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accountability Form Modal */}
      {showAccountabilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Log Activity for {selectedMember?.full_name}</h2>
            <form onSubmit={handleSubmitAccountability}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select 
                    value={accountabilityFormData.activity_type}
                    onChange={(e) => setAccountabilityFormData({...accountabilityFormData, activity_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    required
                  >
                    <option value="">Select activity type</option>
                    <option value="one_on_one">One-on-One Meeting</option>
                    <option value="coaching">Coaching Session</option>
                    <option value="goal_review">Goal Review</option>
                    <option value="performance_check">Performance Check</option>
                    <option value="training">Training Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea 
                    value={accountabilityFormData.remarks}
                    onChange={(e) => setAccountabilityFormData({...accountabilityFormData, remarks: e.target.value})}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Activity details and observations..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={cancelForms}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
