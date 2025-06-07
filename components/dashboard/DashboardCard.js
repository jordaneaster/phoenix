import Link from 'next/link';

export default function DashboardCard({ title, description, icon, href, count }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary-50 rounded-full text-primary-600">
            {icon}
          </div>
          {count !== undefined && count > 0 && (
            <span className="ml-auto bg-primary-100 text-primary-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500 flex-grow">{description}</p>
      </div>
    </Link>
  );
}
