import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { FiEdit, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import LeadNotes from '../../../components/leads/LeadNotes';

export const dynamic = 'force-dynamic';

export default async function LeadDetail({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  const isManager = profile?.role === 'manager';
  
  // Fetch lead
  const { data: lead } = await supabase
    .from('leads')
    .select(`
      *,
      profiles:assigned_to (id, full_name)
    `)
    .eq('id', params.id)
    .single();
  
  if (!lead) {
    notFound();
  }
  
  // Check if current user has access to this lead
  if (!isManager && lead.assigned_to !== session.user.id) {
    notFound();
  }
  
  // Fetch all team members for reassignment (if manager)
  const { data: teamMembers } = isManager ? await supabase
    .from('profiles')
    .select('id, full_name')
    .order('full_name') : { data: null };
  
  // Update the last_contact_at timestamp if viewing the lead
  await supabase
    .from('leads')
    .update({ last_contact_at: new Date().toISOString() })
    .eq('id', params.id);
  
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
        <Link href="/leads" className="flex items-center text-primary-600 hover:text-primary-700">
          <FiArrowLeft className="mr-2" />
          Back to Leads
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Lead Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
          </div>
          <Link href={`/leads/${params.id}/edit`}>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <FiEdit className="mr-2 -ml-0.5 h-4 w-4" />
              Edit
            </button>
          </Link>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{lead.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{lead.email || 'Not provided'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{lead.phone || 'Not provided'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vehicle interest</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{lead.vehicle_interest || 'Not specified'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : 
                  lead.status === 'qualified' ? 'bg-indigo-100 text-indigo-800' : 
                  lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' : 
                  lead.status === 'closed_won' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`}>
                  {statusOptions.find(opt => opt.value === lead.status)?.label || lead.status}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assigned to</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.profiles?.full_name || 'Unassigned'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {lead.notes || 'No notes added yet.'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Communication History</h3>
          <FiMessageSquare className="ml-2 text-gray-400" />
        </div>
        <LeadNotes leadId={params.id} userId={session.user.id} />
      </div>
    </div>
  );
}
