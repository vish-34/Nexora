import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Camera,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowRight,
  Shield,
  Sliders,
  Navigation,
  CheckCircle2,
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  Radio
} from 'lucide-react';
import { api } from '../services/api.js';

export const AiCopilotCard = ({
  selectedZone,
  activeLayer,
  activePersona,
  weather,
  shelters = [],
  reports = [],
  onSetMapLayer,
  onOpenXai,
  onOpenSimulator,
  onOpenCoolPath,
  onSetPersona,
  onResetIndia,
  onFocusRegion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // Wispr Flow Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  const recognitionRef = useRef(null);
  const synthUtteranceRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentTranscriptRef = useRef('');

  // Initialize Wispr Flow Continuous Speech Recognition
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true; // Stay listening across natural pauses
      recognition.interimResults = true; // Stream live transcript
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        currentTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulated += event.results[i][0].transcript + ' ';
        }
        const cleanText = accumulated.trim();
        currentTranscriptRef.current = cleanText;
        setSpeechTranscript(cleanText);
        setQuery(cleanText);

        // Reset auto-silence timer: give user 4 full seconds of silence before auto-submitting
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (currentTranscriptRef.current && currentTranscriptRef.current.trim().length > 3) {
            try {
              recognition.stop();
            } catch (e) {}
          }
        }, 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const finalText = currentTranscriptRef.current.trim();
        if (finalText) {
          handleAskAi(finalText);
          currentTranscriptRef.current = '';
          setSpeechTranscript('');
        }
      };

      recognition.onerror = (err) => {
        console.warn('Wispr Flow Speech Recognition note:', err?.error || err);
        if (err?.error !== 'no-speech') {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Handle Wispr Flow TTS Voice Narration
  const speakBriefing = (text) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    // Pick natural english voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.includes('en-IN') ||
        v.name.includes('Natural') ||
        v.name.includes('Google UK English') ||
        v.name.includes('Samantha') ||
        v.lang.includes('en')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      stopSpeaking();
      setIsExpanded(true); // Auto-expand workspace so the user sees live dictation
      try {
        recognitionRef.current.start();
      } catch (e) {
        // already started
      }
    }
  };

  // Screen Context Gathering
  const gatherActiveScreenContext = () => {
    return {
      active_tab: activePersona === 'citizen' ? 'citizen' : (activeLayer || 'default'),
      selected_zone_id: selectedZone?.id || 'india',
      zone_metrics: {
        name: selectedZone?.name || 'India',
        level: selectedZone?.level || 'country',
        lst_celsius: selectedZone?.lst_celsius || 43.8,
        chrs_risk_score: selectedZone?.chrs_risk_score || 75,
        canopy_cover_pct: selectedZone?.canopy_cover_pct || 14.0,
        wbgt_c: selectedZone?.wbgt_c || 33.5,
        capital: selectedZone?.capital || 'Regional HQ'
      },
      screen_state: {
        active_layer: activeLayer || 'clean-silver-default',
        active_persona: activePersona,
        active_weather: weather ? `${weather.temp_c}°C, ${weather.humidity_pct}% humidity` : '27.4°C, 79% RH',
        cooling_centers_active: shelters.length || 4,
        sos_distress_count: reports.length || 2
      }
    };
  };

  // Autonomous Screen Navigation based on intent
  const executeAutonomousAction = (actionKey) => {
    switch (actionKey) {
      case 'show_heat_risk':
        onSetMapLayer('chrs');
        break;
      case 'show_surface_temp':
        onSetMapLayer('lst');
        break;
      case 'show_canopy':
        onSetMapLayer('ndvi');
        break;
      case 'open_xai':
        onOpenXai();
        break;
      case 'open_simulator':
        onOpenSimulator();
        break;
      case 'open_coolpath':
        onOpenCoolPath();
        break;
      case 'switch_citizen':
        onSetPersona('citizen');
        break;
      case 'switch_admin':
        onSetPersona('admin');
        break;
      case 'reset_india':
        onResetIndia();
        break;
      default:
        break;
    }
  };

  // Execute AI Analysis
  const handleAskAi = async (customPrompt = '') => {
    const promptToUse = customPrompt || query || 'Explain what is currently displayed on my screen and its climate significance.';
    setIsLoading(true);
    setIsExpanded(true);

    const context = gatherActiveScreenContext();

    try {
      const res = await api.explainScreen(context, promptToUse);
      setAiResponse(res);

      // Autonomous Screen Navigation: If query specifically asks for layers or tools, visually navigate!
      const lowerQ = promptToUse.toLowerCase();
      if (lowerQ.includes('heat risk') || lowerQ.includes('risk score') || lowerQ.includes('chrs')) {
        onSetMapLayer('chrs');
      } else if (lowerQ.includes('surface temp') || lowerQ.includes('lst') || lowerQ.includes('ground heat')) {
        onSetMapLayer('lst');
      } else if (lowerQ.includes('canopy') || lowerQ.includes('tree') || lowerQ.includes('ndvi')) {
        onSetMapLayer('ndvi');
      } else if (lowerQ.includes('why') || lowerQ.includes('diagnostics') || lowerQ.includes('audit')) {
        onOpenXai();
      } else if (lowerQ.includes('simulate') || lowerQ.includes('what if') || lowerQ.includes('interventions')) {
        onOpenSimulator();
      } else if (lowerQ.includes('coolpath') || lowerQ.includes('route') || lowerQ.includes('walk')) {
        onOpenCoolPath();
      } else if (lowerQ.includes('citizen') || lowerQ.includes('shelter')) {
        onSetPersona('citizen');
      }

      // Voice Narration
      if (res?.audio_transcript && !isMuted) {
        speakBriefing(res.audio_transcript);
      }
    } catch (err) {
      console.error('Error in Copilot query:', err);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAi();
    }
  };

  const currentZoneName = selectedZone?.name || 'India';
  const currentLST = selectedZone?.lst_celsius || 43.8;
  const currentRisk = selectedZone?.chrs_risk_score || 75;

  return (
    <div className="fixed bottom-6 right-6 z-40 pointer-events-auto select-none font-sans">
      {!isExpanded ? (
        /* COMPACT CAPSULE MODE (Floating in Bottom-Right Corner) */
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/90 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all hover:shadow-[0_12px_36px_rgb(0,0,0,0.14)] animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>NEXORA AI COPILOT</span>
          </button>

          <button
            onClick={() => handleAskAi('Look at my screen and give me a tactical heat briefing')}
            title="Analyze Active Screen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-mono font-medium transition-all cursor-pointer shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Analyze Screen</span>
          </button>

          <button
            onClick={toggleVoiceDictation}
            title="Wispr Flow Voice Dictation"
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED COPILOT WORKSPACE (Floating Bottom-Right Card) */
        <div className="w-[380px] sm:w-[410px] max-h-[82vh] bg-white border border-slate-200/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/60">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-extrabold text-slate-900 uppercase tracking-wide">
                    NEXORA AI COPILOT
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    WISPR FLOW ACTIVE
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Grounded Screen Intelligence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                title="Minimize Copilot"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Screen Context Observer Bar */}
          <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">
                Viewing: <strong className="text-slate-900">{currentZoneName}</strong> ({currentLST}°C • Risk {currentRisk})
              </span>
            </div>

            <button
              onClick={() => handleAskAi('Look at this screen and give me a complete climate factor audit')}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 shrink-0 cursor-pointer bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded border border-orange-200/80 transition-all"
            >
              <span>Scan Screen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Wispr Flow Voice Narration Status (Live Waveform) */}
          {isSpeaking && (
            <div className="px-3.5 py-1.5 bg-orange-50 border-b border-orange-200/70 flex items-center justify-between text-xs text-orange-900 font-mono">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-2"></span>
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-3 delay-75"></span>
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-1.5 delay-150"></span>
                  <span className="w-1 bg-orange-500 rounded-full animate-bounce h-3 delay-100"></span>
                </div>
                <span className="text-[11px] font-semibold">Wispr Flow Narrating Briefing...</span>
              </div>

              <button
                onClick={stopSpeaking}
                className="text-[10px] text-orange-700 underline font-bold cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Copilot Body / Chat & Findings */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-800">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
                  <Sparkles className="w-4 h-4 text-orange-500 absolute inset-0 m-auto" />
                </div>
                <div className="text-center font-mono">
                  <div className="font-bold text-slate-800">Perceiving Screen Telemetry...</div>
                  <div className="text-[10px] text-slate-400">Grounded RAG analysis over active GIS layers</div>
                </div>
              </div>
            ) : aiResponse ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* Title & Summary */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      Grounded Screen Analysis
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-bold">
                      {aiResponse.model_used || 'Grok-2 RAG'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 font-display text-sm leading-tight">
                    {aiResponse.title}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiResponse.summary}
                  </p>
                </div>

                {/* Detailed Explanation */}
                {aiResponse.detailed_explanation && (
                  <div className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                    {aiResponse.detailed_explanation}
                  </div>
                )}

                {/* Grounded Sources */}
                {aiResponse.grounded_sources?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                      Grounded Sources
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {aiResponse.grounded_sources.map((src, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autonomous Screen Navigation Suggestions (Interactive Actions) */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-800 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-orange-500" />
                    <span>Navigate & Show on Screen:</span>
                  </span>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => executeAutonomousAction('show_heat_risk')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Heat Risk Layer
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => executeAutonomousAction('show_surface_temp')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Surface Temp
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => executeAutonomousAction('open_xai')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-orange-500" />
                        XAI Diagnostics
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => executeAutonomousAction('open_simulator')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-blue-500" />
                        What-If Simulator
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => executeAutonomousAction('open_coolpath')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-600" />
                        CoolPath Router
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => executeAutonomousAction('reset_india')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left font-mono text-[10px] font-bold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        Reset to India
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Initial Copilot Welcome State */
              <div className="py-4 space-y-3 text-center">
                <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/80">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ask Nexora AI Copilot</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    I can perceive your active screen, explain thermal anomalies, and navigate through the map layers autonomously.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-1.5 text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Quick Prompts:
                  </span>
                  <button
                    onClick={() => handleAskAi(`Why is ${currentZoneName} experiencing elevated heat risk?`)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 text-left transition-all cursor-pointer truncate"
                  >
                    👉 Why is {currentZoneName} experiencing elevated heat?
                  </button>
                  <button
                    onClick={() => handleAskAi('Switch to the heat risk layer and explain the danger zones')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 text-left transition-all cursor-pointer truncate"
                  >
                    👉 Show heat risk layer & explain danger zones
                  </button>
                  <button
                    onClick={() => handleAskAi('Open the What-If simulation and show what interventions work best')}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 text-left transition-all cursor-pointer truncate"
                  >
                    👉 Open What-If simulation & show best interventions
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wispr Flow Input Dock */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 space-y-2">
            {isListening && (
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-300 shadow-xs animate-in fade-in duration-200">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span><strong>Listening continuously</strong> (take your time)...</span>
                </span>
                <button
                  onClick={toggleVoiceDictation}
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs cursor-pointer shadow-xs transition-all"
                >
                  Send Now
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceDictation}
                title="Wispr Flow Voice Dictation"
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? 'Listening...' : 'Ask Copilot or dictate...'}
                  className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
                />
                <button
                  onClick={() => handleAskAi()}
                  disabled={isLoading || !query.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-900 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
