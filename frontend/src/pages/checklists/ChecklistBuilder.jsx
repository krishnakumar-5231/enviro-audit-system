import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { checklistAPI } from '../../services/api';
import Toast from '../../components/common/Toast';

export default function ChecklistBuilder() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [checklistCode, setChecklistCode] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0');
  const [industryType, setIndustryType] = useState('General Industrial');

  const [categories, setCategories] = useState([
    { name: 'Air Quality & Emissions', description: 'Air point source emissions and CEMS' },
    { name: 'Effluent & Wastewater Treatment', description: 'Discharge compliance and treatment' },
    { name: 'Hazardous Waste Management', description: 'RCRA secondary containment and manifests' }
  ]);

  const [newCatName, setNewCatName] = useState('');

  const [questions, setQuestions] = useState([
    {
      questionId: 'Q-01',
      category: 'Air Quality & Emissions',
      questionText: 'Are Continuous Emission Monitoring Systems (CEMS) properly calibrated with daily drift logs?',
      requirementReference: 'Clean Air Act / 40 CFR Part 60',
      riskLevel: 'Critical',
      isMandatory: true
    },
    {
      questionId: 'Q-02',
      category: 'Effluent & Wastewater Treatment',
      questionText: 'Are treated effluent discharge parameters (pH, COD, BOD, TSS) within NPDES permit limits?',
      requirementReference: 'Clean Water Act NPDES Outfall 001',
      riskLevel: 'Critical',
      isMandatory: true
    },
    {
      questionId: 'Q-03',
      category: 'Hazardous Waste Management',
      questionText: 'Do all hazardous drum storage areas maintain 110% secondary containment without cracks?',
      requirementReference: '40 CFR 264.175 Secondary Containment',
      riskLevel: 'High',
      isMandatory: true
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories([...categories, { name: newCatName.trim(), description: '' }]);
    setNewCatName('');
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    const nextId = `Q-${String(questions.length + 1).padStart(2, '0')}`;
    setQuestions([
      ...questions,
      {
        questionId: nextId,
        category: categories[0]?.name || 'General',
        questionText: '',
        requirementReference: '',
        riskLevel: 'Medium',
        isMandatory: true
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !checklistCode) {
      setToast({ message: 'Checklist title and unique code are required.', type: 'error' });
      return;
    }

    if (questions.length === 0) {
      setToast({ message: 'Please add at least one question to the checklist.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await checklistAPI.createChecklist({
        checklistCode: checklistCode.toUpperCase(),
        title,
        description,
        version,
        industryType,
        categories,
        questions: questions.map((q, idx) => ({ ...q, order: idx + 1 }))
      });
      setToast({ message: 'Checklist template successfully published!', type: 'success' });
      setTimeout(() => navigate('/checklists'), 1200);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error saving checklist template.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/checklists')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Configurable Checklist Builder
            </h2>
            <p className="text-xs text-slate-500">
              Create dynamic inspection question banks tailored to industrial sectors and statutory standards.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Publish Checklist</span>
        </button>
      </div>

      {/* Template Metadata Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Template Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Checklist Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Petrochemical Environmental Standard Operating Checklist"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Checklist Code *</label>
            <input
              type="text"
              required
              value={checklistCode}
              onChange={(e) => setChecklistCode(e.target.value)}
              placeholder="e.g. PETRO-EHS-2026"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Industry Classification</label>
            <input
              type="text"
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value)}
              placeholder="e.g. General Industrial, Chemical, Steel"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Version String</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Scope Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Operational scope and regulatory standards encompassed in this checklist..."
            className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Categories Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Inspection Categories ({categories.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold space-x-2"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={() => removeCategory(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Add new category (e.g. Spill Prevention)..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 flex-1 max-w-sm"
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Questions Builder */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Checklist Questions ({questions.length})</h3>
            <p className="text-xs text-slate-400">Configure questions, reference statutes, and risk scoring</p>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  #{idx + 1} Question Code: {q.questionId}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Question Prompt *</label>
                <input
                  type="text"
                  required
                  value={q.questionText}
                  onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                  placeholder="Enter audit requirement or physical verification question..."
                  className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Category</label>
                  <select
                    value={q.category}
                    onChange={(e) => updateQuestion(idx, 'category', e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Statutory Reference</label>
                  <input
                    type="text"
                    value={q.requirementReference}
                    onChange={(e) => updateQuestion(idx, 'requirementReference', e.target.value)}
                    placeholder="e.g. 40 CFR 264.175"
                    className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Risk Severity Level</label>
                  <select
                    value={q.riskLevel}
                    onChange={(e) => updateQuestion(idx, 'riskLevel', e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
