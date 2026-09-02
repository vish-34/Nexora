import React from 'react';
import { Siren, Clock, MapPin, Sparkles, CheckCircle } from 'lucide-react';

export const IncidentFeed = ({ reports, onSelectIncident }) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Community Distress Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60">
          {reports?.length || 0} Reports Active
        </span>
      </div>

      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {reports?.map((report) => {
          const isEmergency = report.urgency === 'Emergency' || report.urgency === 'Critical';
          return (
            <div
              key={report.id}
              onClick={() => onSelectIncident && onSelectIncident(report)}
              className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isEmergency ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`}></span>
                  <span className="text-xs font-bold text-white">{report.category}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    isEmergency
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {report.urgency}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mb-2">{report.description}</p>

              {report.ai_triage?.recommended_action && (
                <div className="bg-rose-950/40 p-1.5 rounded border border-rose-900/40 text-[10px] text-rose-300 flex items-start gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dispatch Action:</strong> {report.ai_triage.recommended_action}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>By {report.reporter_name}</span>
                <span>{report.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
