import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { FiPlay, FiCheck, FiFileText } from 'react-icons/fi';

// FORCE MOCK DATA: Always enable mock data in any environment
const ALWAYS_ENABLE_MOCK = true;

export const dynamic = 'force-dynamic';

export default async function Training() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if mock data is enabled (either in dev mode, via env var, or forced)
  const isDev = process.env.NODE_ENV === 'development';
  const enableMockData = ALWAYS_ENABLE_MOCK || isDev || process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';
  
  // Default values
  let trainingContent = [];
  let completedTrainingIds = new Set();
  
  // Only query Supabase if we have a session
  if (session) {
    // Get all training content
    const { data: content } = await supabase
      .from('training_content')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (content) {
      trainingContent = content;
    }
    
    // Get completed training for the user
    const { data: completedTraining } = await supabase
      .from('training_progress')
      .select('training_id')
      .eq('user_id', session.user.id);
    
    // Create a set of completed training IDs for easy lookup
    completedTrainingIds = new Set(
      completedTraining ? completedTraining.map(item => item.training_id) : []
    );
  } else if (enableMockData) {
    // Mock training content
    trainingContent = [
      {
        id: '1',
        title: 'Sales Process Overview',
        description: 'Learn the fundamentals of our sales process',
        content_url: 'https://example.com/videos/sales-process',
        content_type: 'video',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Product Knowledge: Sedan Line',
        description: 'Detailed features of our sedan product line',
        content_url: 'https://example.com/videos/sedan-features',
        content_type: 'video',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Handling Objections',
        description: 'Techniques for addressing common customer objections',
        content_url: 'https://example.com/videos/objections',
        content_type: 'video',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'CRM Usage Guide',
        description: 'How to effectively use Phoenix CRM',
        content_url: 'https://example.com/docs/crm-guide',
        content_type: 'document',
        created_at: new Date().toISOString()
      }
    ];
    
    // Mark some training as completed for development
    completedTrainingIds = new Set(['1', '3']);
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Training Center</h1>
        
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <FiCheck className="inline-block mr-1" /> 
          {completedTrainingIds.size} / {trainingContent.length} Completed
        </div>
      </div>
      
      {!session && isDev && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
          <p className="mt-1 text-xs text-yellow-700">
            Using mock training data because no authenticated session was found.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingContent.map((training) => (
          <div key={training.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{training.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{training.description}</p>
                </div>
                {completedTrainingIds.has(training.id) ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Completed
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    New
                  </span>
                )}
              </div>
              
              <div className="mt-4 flex justify-between">
                <a 
                  href={training.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {training.content_type === 'video' ? (
                    <>
                      <FiPlay className="mr-1" /> Watch Video
                    </>
                  ) : (
                    <>
                      <FiFileText className="mr-1" /> View Document
                    </>
                  )}
                </a>
                
                {!completedTrainingIds.has(training.id) && (
                  <button
                    disabled={!session}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {trainingContent.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No training content available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
