import React from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Navigation,
  Plus
} from 'lucide-react';

export const SosDistressModal = ({
  reports = [],
  onClose,
  onOpenReportModal,
  onFocusReport
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-6 overflow-hidden text-slate-900 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wide">
                  Community Distress Reports
                </h3>
                <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                  {reports.length} Live Alerts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time crowdsourced heat exhaustion & hydration incidents with AI Triage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Alert</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reports Feed Scrollable List */}
        <div className="overflow-y-auto space-y-3 pr-1 grow">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium text-slate-600">No active distress reports in this sector.</p>
              <p className="text-xs text-slate-400 mt-1">Municipal cooling triage is operating normally.</p>
            </div>
          ) : (
            reports.map((report) => {
              const isCritical = report.urgency === 'Critical' || report.urgency === 'Emergency';
              const coords = report.location?.coordinates || [report.location?.lng, report.location?.lat];

              return (
                <div
                  key={report.id || report._id}
                  className="bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 transition-all shadow-xs space-y-2.5"
                >
                  {/* Top Bar: Category, Urgency, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      ></span>
                      <h4 className="text-sm font-bold text-slate-900 font-sans">
                        {report.category || 'Heat Stress Distress'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                          isCritical
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {report.urgency || 'High'}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {report.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Citizen's Description */}
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {report.description}
                  </p>

                  {/* AI NLP Triage Recommendation */}
                  {report.ai_triage?.recommended_action && (
                    <div className="bg-orange-50/70 border border-orange-200/70 rounded-lg p-2.5 text-xs text-orange-900 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-orange-950 font-mono text-[11px] uppercase">
                          AI Triage Protocol:
                        </strong>{' '}
                        <span>{report.ai_triage.recommended_action}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer: Metadata & Focus on Map Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{report.reporter_name || 'Citizen'}</span>
                      </span>
                      {report.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{report.phone}</span>
                        </span>
                      )}
                      {report.created_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>

                    {coords && coords[0] && (
                      <button
                        onClick={() => {
                          if (onFocusReport) {
                            onFocusReport(report);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-mono text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>[ View Location ]</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
