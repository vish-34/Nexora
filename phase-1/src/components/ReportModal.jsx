import React, { useState } from 'react';
import { X, Send, CheckCircle2, Sparkles, Phone, User, Droplets } from 'lucide-react';
import { api } from '../services/api.js';

export const ReportModal = ({ activeRegion, onClose, onReportSubmitted }) => {
  const [reporterName, setReporterName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Hydration Crisis');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [triageResponse, setTriageResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const baseLat = activeRegion?.geoCentroid ? activeRegion.geoCentroid[1] : (activeRegion?.lat || 19.076);
      const baseLng = activeRegion?.geoCentroid ? activeRegion.geoCentroid[0] : (activeRegion?.lng || 72.877);

      const payload = {
        reporter_name: reporterName.trim() || 'Anonymous Citizen',
        phone: phone.trim() || '+91 98200 00000',
        category,
        description: description.trim(),
        zone_id: activeRegion?.id || 'india',
        location: {
          lat: +(baseLat + (Math.random() - 0.5) * 0.01).toFixed(4),
          lng: +(baseLng + (Math.random() - 0.5) * 0.01).toFixed(4)
        }
      };

      const result = await api.submitCitizenReport(payload);
      setTriageResponse(result?.data || result);
      if (onReportSubmitted) {
        onReportSubmitted(result?.data || result);
      }
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-7 overflow-hidden text-slate-900">
        {/* Title Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200/60">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wide">
                Submit Heat Distress Alert
              </h3>
              <p className="text-xs text-slate-500">Direct transmission to Municipal Triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {triageResponse ? (
          /* Triage Result */
          <div className="text-center py-4 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Incident Registered</h4>
            <p className="text-xs text-slate-500 mb-4">
              AI Decision Engine classified your report and notified municipal emergency dispatch.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-800 font-mono flex items-center gap-1.5 uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Triage Recommendation:
                </span>
                <span className="text-[10px] font-mono font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-200">
                  {triageResponse.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-700 mb-1 leading-relaxed">
                {triageResponse.ai_triage?.recommended_action}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Close & View on Map
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="Hydration Crisis">💧 Hydration Crisis (No drinking water / dry tap)</option>
                <option value="Heat Exhaustion">⚠️ Heat Exhaustion (Person collapsed or dizzy)</option>
                <option value="Broken Infrastructure">🔧 Broken Infrastructure (Damaged misting fan)</option>
                <option value="Shelter Needed">🏠 Shelter Needed (Overcrowding / lack of shade)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">
                Situation Details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Drinking water tap broken near transit camp crossroad, workers dizzy..."
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">Your Name</label>
                <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2">
                  <User className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Ramesh Patil"
                    className="bg-transparent text-xs text-slate-900 focus:outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">Phone</label>
                <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 XXXXX"
                    className="bg-transparent text-xs text-slate-900 focus:outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading ? (
                <span>Running NLP Triage...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Distress Alert</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
