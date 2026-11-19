import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListTodo, ArrowLeft, Layers, ShieldCheck, Check } from 'lucide-react';
import { checklistAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ChecklistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const res = await checklistAPI.getChecklist(id);
        setChecklist(res.data.data);
      } catch (err) {
        console.error('Error fetching checklist details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading checklist template..." />;
  }

  if (!checklist) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Checklist template not found.</p>
        <button
          onClick={() => navigate('/checklists')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Checklists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/checklists')}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{checklist.title}</h2>
            <Badge status={checklist.status} />
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Code: {checklist.checklistCode} • Version: {checklist.version} • {checklist.industryType}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <p className="text-xs text-slate-600">{checklist.description || 'Standard industrial compliance checklist.'}</p>
      </div>

      {/* Categories & Questions View */}
      <div className="space-y-4">
        {checklist.categories?.map((cat, idx) => {
          const catQuestions = checklist.questions?.filter((q) => q.category === cat.name) || [];

          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>{cat.name}</span>
                <span className="text-xs font-normal text-slate-400">({catQuestions.length} questions)</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {catQuestions.map((q) => (
                  <div key={q.questionId} className="py-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {q.questionId}
                        </span>
                        <Badge status={q.riskLevel} size="xs" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{q.questionText}</p>
                      {q.requirementReference && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Ref: {q.requirementReference}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
