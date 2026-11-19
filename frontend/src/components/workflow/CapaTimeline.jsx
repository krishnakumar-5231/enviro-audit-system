import React from 'react';
import { CheckCircle2, Clock, Check, ArrowRight } from 'lucide-react';

export default function CapaTimeline({ capa }) {
  const steps = [
    {
      id: 'Assigned',
      label: 'Action Assigned',
      desc: capa.responsiblePerson?.name ? `Assigned to ${capa.responsiblePerson.name}` : 'Owner designated',
      date: capa.createdAt
    },
    {
      id: 'In Progress',
      label: 'Action In Progress',
      desc: capa.progressPercentage > 0 ? `${capa.progressPercentage}% progress reported` : 'Corrective works pending',
      date: capa.updatedAt
    },
    {
      id: 'Pending Verification',
      label: 'Submitted for Verification',
      desc: 'Evidence uploaded & sign-off requested',
      date: capa.completedDate
    },
    {
      id: 'Verified',
      label: 'Approved & Verified',
      desc: capa.verifiedBy?.name ? `Verified by ${capa.verifiedBy.name}` : 'Compliance verified',
      date: capa.verifiedDate
    },
    {
      id: 'Closed',
      label: 'Action Closed',
      desc: 'Finding resolved and verified',
      date: capa.closedDate
    }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Open': return 0;
      case 'Assigned': return 0;
      case 'In Progress': return 1;
      case 'Pending Verification': return 2;
      case 'Verified': return 3;
      case 'Closed': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(capa.status);

  return (
    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        CAPA Lifecycle Workflow
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || (idx === 4 && capa.status === 'Closed') || (idx === 3 && (capa.status === 'Verified' || capa.status === 'Closed'));
          const isCurrent = idx === currentIndex && capa.status !== 'Closed';

          return (
            <div
              key={step.id}
              className={`relative p-3 rounded-xl border transition-all ${
                isDone
                  ? 'bg-white border-emerald-200 shadow-sm'
                  : isCurrent
                  ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-white/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1">{step.label}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">{step.desc}</p>
              {step.date && isDone && (
                <p className="mt-1 text-[10px] text-slate-400">
                  {new Date(step.date).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
