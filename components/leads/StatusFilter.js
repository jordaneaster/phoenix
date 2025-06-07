'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';
import { useCallback } from 'react';

export default function StatusFilter({ statusOptions, currentStatus = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleStatusChange = (e) => {
    const status = e.target.value;
    const query = createQueryString('status', status);
    router.push(`${pathname}?${query}`);
  };

  return (
    <div className="relative">
      <select
        className="appearance-none pl-8 pr-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
        value={currentStatus}
        onChange={handleStatusChange}
      >
        <option value="">All Statuses</option>
        {statusOptions.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
        <FiFilter className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}
