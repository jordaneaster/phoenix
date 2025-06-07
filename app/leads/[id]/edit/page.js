'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase/client';
import Link from 'next/link';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditLead({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_interest: '',
    status: 'new',
    assigned_to: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Check if user is manager
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setIsManager(profile?.role === 'manager');
        
        // Fetch lead
        const { data: lead, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error || !lead) {
          toast.error('Lead not found');
          router.push('/leads');
          return;
        }
        
        // Check if user has access to this lead
        if (!isManager && lead.assigned_to !== session.user.id) {
          toast.error('You don\'t have permission to edit this lead');
          router.push('/leads');
          return;
        }
        
        setLead(lead);
        setFormData({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          vehicle_interest: lead.vehicle_interest || '',
          status: lead.status || 'new',
          assigned_to: lead.assigned_to || '',
          notes: lead.notes || ''
        });
        
        // Fetch team members if manager
        if (profile?.role === 'manager') {
          const { data: members } = await supabase
            .from('profiles')
            .select('id, full_name')
            .order('full_name');
          
          setTeamMembers(members || []);
        }
      } catch (error) {
        toast.error('Error loading lead data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      toast.success('Lead updated successfully');
      router.push(`/leads/${params.id}`);
    } catch (error) {
      toast.error('Error updating lead');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'closed_won', label: 'Closed (Won)' },
    { value: 'closed_lost', label: 'Closed (Lost)' }
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href={`/leads/${params.id}`} className="flex items-center text-primary-600 hover:text-primary-700">
          <FiArrowLeft className="mr-2" />
          Back to Lead
        </Link>
      </div>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Lead</h3>
          
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="vehicle_interest" className="block text-sm font-medium text-gray-700">
                  Vehicle interest
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="vehicle_interest"
                    id="vehicle_interest"
                    value={formData.vehicle_interest}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {isManager && (
                <div className="sm:col-span-3">
                  <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                    Assigned to
                  </label>
                  <div className="mt-1">
                    <select
                      id="assigned_to"
                      name="assigned_to"
                      value={formData.assigned_to || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Link href={`/leads/${params.id}`}>
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
