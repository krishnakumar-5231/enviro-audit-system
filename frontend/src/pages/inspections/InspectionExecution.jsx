import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  ArrowLeft,
  Save,
  Send,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileCheck,
  Award,
  Plus
} from 'lucide-react';
import { inspectionAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import FindingModal from '../findings/FindingModal';

export default function InspectionExecution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Finding creation from non-compliance item
  const [findingModalOpen, setFindingModalOpen] = useState(false);
  const [selectedQuestionForFinding, setSelectedQuestionForFinding] = useState(null);

  const fetchInspection = async () => {
    setLoading(true);
    try {
      const res = await inspectionAPI.getInspection(id);
      setInspection(res.data.data);
      setItems(res.data.data.items || []);
    } catch (err) {
      console.error('Error fetching inspection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  // Recalculate statistics dynamically on client
  const calculateStats = (currentItems) => {
    let compliant = 0;
    let nonCompliant = 0;
    let partial = 0;
    let na = 0;

    currentItems.forEach((i) => {
      if (i.response === 'Compliant') compliant++;
      else if (i.response === 'Non-Compliant') nonCompliant++;
      else if (i.response === 'Partially Compliant') partial++;
      else if (i.response === 'Not Applicable') na++;
    });

    const applicable = currentItems.length - na;
    const score = applicable > 0 ? Math.round(((compliant + partial * 0.5) / applicable) * 100) : 100;

    return {
      total: currentItems.length,
      compliant,
      nonCompliant,
      partial,
      na,
      score: Math.min(100, Math.max(0, score))
    };
  };

  const handleResponseChange = (questionId, responseValue) => {
    setItems((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, response: responseValue } : item
      )
    );
  };

  const handleObservationChange = (questionId, text) => {
    setItems((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, observation: text } : item
      )
    );
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await inspectionAPI.updateInspectionItems(id, { items });
      setToast({ message: 'Inspection checklist progress saved successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error saving progress.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitInspection = async () => {
    setSaving(true);
    try {
      await inspectionAPI.updateInspectionItems(id, { items });
      await inspectionAPI.submitInspection(id);
      setToast({ message: 'Digital inspection successfully submitted for compliance review!', type: 'success' });
      setTimeout(() => {
        navigate(`/audits/${inspection.audit?._id || inspection.audit}`);
      }, 1200);
    } catch (err) {
      setToast({ message: 'Error submitting inspection.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (questionId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await inspectionAPI.uploadEvidence(id, questionId, formData);
      setItems((prev) =>
        prev.map((item) =>
          item.questionId === questionId ? res.data.data : item
        )
      );
      setToast({ message: `Evidence "${file.name}" uploaded successfully.`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Error uploading evidence file.', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading digital checklist execution interface..." />;
  }

  if (!inspection) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Inspection record not found.</p>
        <button
          onClick={() => navigate('/audits')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Audits
        </button>
      </div>
    );
  }

  const liveStats = calculateStats(items);

  // Group items by category
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Top Header & Live Compliance Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/audits/${inspection.audit?._id || inspection.audit}`)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {inspection.checklist?.title || 'Inspection Checklist'}
                </h2>
                <Badge status={inspection.status} />
              </div>
              <p className="text-xs text-slate-500">
                Code: {inspection.inspectionCode} • Facility: {inspection.site?.name}
              </p>
            </div>
          </div>

          {/* Real-time Score Counter */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-teal-600" />
              <div>
                <span className="text-lg font-black text-teal-700">{liveStats.score}%</span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Compliance Score</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={saving}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitInspection}
                disabled={saving}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inspection</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
          <div className="bg-emerald-50 py-1 rounded-xl text-emerald-800 text-xs font-semibold">
            {liveStats.compliant} Compliant
          </div>
          <div className="bg-rose-50 py-1 rounded-xl text-rose-800 text-xs font-semibold">
            {liveStats.nonCompliant} Non-Compliant
          </div>
          <div className="bg-amber-50 py-1 rounded-xl text-amber-800 text-xs font-semibold">
            {liveStats.partial} Partially Compliant
          </div>
          <div className="bg-slate-100 py-1 rounded-xl text-slate-600 text-xs font-semibold">
            {liveStats.na} Not Applicable
          </div>
        </div>
      </div>

      {/* Checklist Question Categories */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = items.filter((i) => i.category === category);

          return (
            <div
              key={category}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{category}</h3>
                  <p className="text-xs text-slate-400">
                    {categoryItems.length} inspection criteria to evaluate
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {categoryItems.map((item, idx) => {
                  const isNonCompliant =
                    item.response === 'Non-Compliant' || item.response === 'Partially Compliant';

                  return (
                    <div
                      key={item.questionId}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.response === 'Non-Compliant'
                          ? 'border-rose-200 bg-rose-50/20'
                          : item.response === 'Compliant'
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200/80 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                              {item.questionId}
                            </span>
                            <Badge status={item.riskLevel} label={`${item.riskLevel} Risk`} size="xs" />
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1.5">
                            {item.questionText}
                          </p>
                          {item.requirementReference && (
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Ref: {item.requirementReference}
                            </p>
                          )}
                        </div>

                        {/* Response Selectors */}
                        <div className="flex flex-wrap gap-1.5 self-start">
                          {['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Applicable'].map(
                            (resp) => {
                              const isSelected = item.response === resp;
                              return (
                                <button
                                  key={resp}
                                  type="button"
                                  onClick={() => handleResponseChange(item.questionId, resp)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? resp === 'Compliant'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : resp === 'Non-Compliant'
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                        : resp === 'Partially Compliant'
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                        : 'bg-slate-700 text-white border-slate-700'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {resp}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>

                      {/* Observations & Evidence Row */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Auditor Observation & Notes
                          </label>
                          <textarea
                            rows={2}
                            value={item.observation || ''}
                            onChange={(e) => handleObservationChange(item.questionId, e.target.value)}
                            placeholder="Enter physical inspection observation, measurement reading, or non-conformance details..."
                            className="mt-1 w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Supporting Photographic / Doc Evidence
                          </label>
                          <div className="mt-1 flex items-center space-x-2">
                            <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors">
                              <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              <span>Attach File</span>
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(item.questionId, e)}
                              />
                            </label>
                            {item.evidenceFiles?.length > 0 && (
                              <span className="text-[11px] font-medium text-teal-600">
                                {item.evidenceFiles.length} attached
                              </span>
                            )}
                          </div>

                          {/* Quick 1-click Create Finding Button for non-compliant items */}
                          {isNonCompliant && (
                            <div className="mt-2">
                              {item.findingCreated ? (
                                <span className="inline-flex items-center text-[11px] text-emerald-600 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Finding Recorded
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuestionForFinding(item);
                                    setFindingModalOpen(true);
                                  }}
                                  className="w-full inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                  <span>Raise Finding</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for raising Finding directly from checklist item */}
      {selectedQuestionForFinding && (
        <FindingModal
          isOpen={findingModalOpen}
          onClose={() => {
            setFindingModalOpen(false);
            setSelectedQuestionForFinding(null);
          }}
          defaultAuditId={inspection.audit?._id || inspection.audit}
          defaultInspectionId={inspection._id}
          defaultSiteId={inspection.site?._id || inspection.site}
          defaultQuestionId={selectedQuestionForFinding.questionId}
          defaultQuestionText={selectedQuestionForFinding.questionText}
          defaultCategory={selectedQuestionForFinding.category}
          defaultSeverity={selectedQuestionForFinding.riskLevel}
          defaultRequirementReference={selectedQuestionForFinding.requirementReference}
          defaultDescription={selectedQuestionForFinding.observation}
          onSaved={() => {
            fetchInspection();
            setToast({ message: 'Non-conformance finding recorded!', type: 'success' });
          }}
        />
      )}
    </div>
  );
}
