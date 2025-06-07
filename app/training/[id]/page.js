import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft, FiPlay, FiBook, FiCheck } from 'react-icons/fi';
import MarkAsCompleted from '../../../components/training/MarkAsCompleted';

export const dynamic = 'force-dynamic';

export default async function TrainingDetail({ params }) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Fetch training content
  const { data: training } = await supabase
    .from('training_content')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!training) {
    notFound();
  }
  
  // Check if user has completed this training
  const { data: progress } = await supabase
    .from('training_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('training_id', params.id)
    .single();
  
  const completed = !!progress;
  
  return (
    <div>
      <div className="mb-6">
        <Link href="/training" className="flex items-center text-primary-600 hover:text-primary-700">
          <FiArrowLeft className="mr-2" />
          Back to Training Center
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{training.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{training.description}</p>
          </div>
          {completed ? (
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <FiCheck className="mr-1 h-4 w-4" />
              Completed
            </span>
          ) : (
            <MarkAsCompleted trainingId={params.id} userId={session.user.id} />
          )}
        </div>
        
        <div className="border-t border-gray-200">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100">
            {training.content_type === 'video' ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FiPlay className="mx-auto h-16 w-16 text-primary-600" />
                  <p className="mt-4 text-gray-500">Video content would be embedded here</p>
                  <a 
                    href={training.content_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Open Video Link
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FiBook className="mx-auto h-16 w-16 text-primary-600" />
                  <p className="mt-4 text-gray-500">Document content would be embedded here</p>
                  <a 
                    href={training.content_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Open Document Link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Content Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{training.content_type}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Added</dt>
              <dd className="mt-1 text-sm text-gray-900">{new Date(training.created_at).toLocaleDateString()}</dd>
            </div>
            {completed && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Completed</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(progress.completed_at).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
