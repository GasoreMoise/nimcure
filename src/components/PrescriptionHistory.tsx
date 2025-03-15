'use client';

import { Patient } from '@/contexts/PatientsContext';

export function PrescriptionHistory({ history }: { 
  history: Patient['medicationHistory'] 
}) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {history.map((event, eventIdx) => (
          <li key={event.date}>
            <div className="relative pb-8">
              {eventIdx !== history.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    {/* Icon based on action */}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.action} <span className="font-medium text-gray-900">{event.medicationName}</span>
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 