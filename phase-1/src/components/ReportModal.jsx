import React, { useState } from 'react';
import { X, Send, CheckCircle2, Sparkles, Phone, User, Droplets } from 'lucide-react';
import { api } from '../services/api.js';

export const ReportModal = ({ onClose, onReportSubmitted }) => {
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
      const payload = {
        reporter_name: reporterName.trim() || 'Anonymous Citizen',
        phone: phone.trim() || '+91 98200 00000',
        category,
        description: description.trim(),
        location: {
          lat: 19.0430 + (Math.random() - 0.5) * 0.005,
          lng: 72.8550 + (Math.random() - 0.5) * 0.005
        }
      };

      const result = await api.submitCitizenReport(payload);
      setTriageResponse(result);
      if (onReportSubmitted) {
        onReportSubmitted(result);
      }
    } catch (err) {
      console.error('Failed to submit report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#10231c]/95 border border-white/[0.08] rounded-2xl shadow-2xl p-7 overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-300/10 text-lime-300">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">
                Submit Heat Distress Alert
              </h3>
              <p className="text-xs text-sage-400">Direct transmission to Municipal Triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-sage-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {triageResponse ? (
          /* Triage Result */
          <div className="text-center py-4 animate-fade-in">
            <div className="w-12 h-12 bg-lime-300/10 border border-lime-300/30 rounded-full flex items-center justify-center mx-auto mb-3 text-lime-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Incident Registered</h4>
            <p className="text-xs text-sage-400 mb-4">
              AI NLP classified your report and notified emergency dispatch.
            </p>

            <div className="bg-[#18342a]/80 border border-white/[0.06] rounded-xl p-4 text-left mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-lime-300 font-mono flex items-center gap-1.5 uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> AI Triage Recommendation:
                </span>
                <span className="text-[10px] font-mono font-bold bg-lime-300/10 text-lime-300 px-2 py-0.5 rounded border border-lime-300/20">
                  {triageResponse.urgency}
                </span>
              </div>
              <p className="text-xs text-sage-200 mb-1 leading-relaxed">
                {triageResponse.ai_triage?.recommended_action}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Close & View on Map
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-sage-300 mb-1.5">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18342a] border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-lime-300"
              >
                <option value="Hydration Crisis">💧 Hydration Crisis (No water / dry tap)</option>
                <option value="Heat Exhaustion">⚠️ Heat Exhaustion (Person collapsed or dizzy)</option>
                <option value="Broken Infrastructure">🔧 Broken Infrastructure (Damaged misting fan)</option>
                <option value="Shelter Needed">🏠 Shelter Needed (Overcrowding / lack of shade)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-sage-300 mb-1.5">
                Situation Details <span className="text-lime-300">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Drinking water tap broken near transit camp crossroad, workers dizzy..."
                className="w-full bg-[#18342a] border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-lime-300 placeholder:text-sage-500 resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-sage-300 mb-1.5">Your Name</label>
                <div className="flex items-center bg-[#18342a] border border-white/[0.08] rounded-xl px-3 py-2">
                  <User className="w-3.5 h-3.5 text-sage-400 mr-2" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Ramesh Patil"
                    className="bg-transparent text-xs text-white focus:outline-none w-full placeholder:text-sage-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-sage-300 mb-1.5">Phone</label>
                <div className="flex items-center bg-[#18342a] border border-white/[0.08] rounded-xl px-3 py-2">
                  <Phone className="w-3.5 h-3.5 text-sage-400 mr-2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 XXXXX"
                    className="bg-transparent text-xs text-white focus:outline-none w-full placeholder:text-sage-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-300 hover:bg-lime-200 text-[#10231c] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
