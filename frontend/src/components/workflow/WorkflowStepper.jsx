import React from 'react';
import { Check } from 'lucide-react';

export default function WorkflowStepper({ currentStatus }) {
  const steps = [
    { id: 'Scheduled', label: '1. Scheduled' },
    { id: 'In Progress', label: '2. In Progress' },
    { id: 'Submitted', label: '3. Submitted' },
    { id: 'Under Review', label: '4. Under Review' },
    { id: 'Completed', label: '5. Completed' },
    { id: 'Closed', label: '6. Closed' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Draft': return -1;
      case 'Scheduled': return 0;
      case 'In Progress': return 1;
      case 'Submitted': return 2;
      case 'Under Review': return 3;
      case 'Completed': return 4;
      case 'Closed': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-600 transition-all duration-300 z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  isDone
                    ? 'bg-teal-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-white border-2 border-teal-600 text-teal-700 ring-4 ring-teal-100 font-bold'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  isCurrent
                    ? 'text-teal-900 font-bold'
                    : isDone
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
