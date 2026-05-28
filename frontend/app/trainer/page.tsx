'use client';
import { apiFetch } from '@/lib/api';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import {
  Activity,
  Play,
  Square,
  Volume2,
  VolumeX,
  Camera,
  ChevronRight,
  Award,
  VideoOff
} from 'lucide-react';

export default function AITrainer() {
  const router = useRouter();
  const [exercise, setExercise] = useState<'squat' | 'pushup'>('squat');
  const [isActive, setIsActive] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState<string[]>(['Adjust camera to see your full profile.', 'Click Start Session when ready.']);
  const [formStatus, setFormStatus] = useState('Idle');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Timers and stats
  const [seconds, setSeconds] = useState(0);
  const [calories, setCalories] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speakThrottleRef = useRef<{ [key: string]: number }>({});

  // Display frame (can be base64 stream from FastAPI or raw canvas fallback)
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Handle active session timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Handle estimated calories (approx 0.5 kcal per rep for squats, 0.4 for pushups)
  useEffect(() => {
    const factor = exercise === 'squat' ? 0.6 : 0.5;
    setCalories(Math.round(reps * factor * 10) / 10);
  }, [reps, exercise]);

  // Voice trainer helper
  const speakFeedback = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Throttle duplicate audio readouts (e.g. read out corrections every 4 seconds max)
    const now = Date.now();
    const lastSpoken = speakThrottleRef.current[text] || 0;
    if (now - lastSpoken < 4000) return;

    speakThrottleRef.current[text] = now;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Start webcam and connect WebSocket
  const startSession = async () => {
    setReps(0);
    setSeconds(0);
    setProcessedFrame(null);
    speakThrottleRef.current = {};

    try {
      // Connect to webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialize WebSocket
      const baseWsUrl = process.env.NEXT_PUBLIC_AI_WS_URL || 'ws://127.0.0.1:8000';
      const wsUrl = `${baseWsUrl}/pose`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        setIsActive(true);
        setFormStatus('Ready');
        setFeedback(['WebSocket Connected. Processing frames...']);
        // Start streaming frames
        sendFrames();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.reps !== undefined) setReps(data.reps);
          if (data.status !== undefined) setFormStatus(data.status);
          
          if (data.feedback && Array.isArray(data.feedback)) {
            setFeedback(data.feedback);
            // Read out loud the first correction if present
            const keyFeedback = data.feedback[0];
            if (keyFeedback && !keyFeedback.toLowerCase().includes('good form') && !keyFeedback.toLowerCase().includes('starting')) {
              speakFeedback(keyFeedback);
            } else if (keyFeedback && keyFeedback.toLowerCase().includes('good form')) {
              // occasionally speak motivation
              speakFeedback("Good form! Keep going.");
            }
          }

          if (data.image) {
            setProcessedFrame(`data:image/jpeg;base64,${data.image}`);
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        stopWebcam();
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error:', err);
        setFeedback(['Service Offline. Run python ai-service/main.py.']);
        setWsConnected(false);
        stopWebcam();
      };

    } catch (err: any) {
      console.error('Webcam Access Error:', err);
      setFeedback(['Camera permission denied or camera unavailable. Check browser settings.']);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture canvas snapshots and send to server
  const sendFrames = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const captureLoop = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Convert to JPEG blob or base64
      const base64Data = canvas.toDataURL('image/jpeg', 0.65).split(',')[1];
      
      const payload = {
        image: base64Data,
        exercise: exercise
      };
      
      wsRef.current.send(JSON.stringify(payload));

      // Limit FPS (120ms delay is approx 8 FPS - perfect balance of speed and bandwidth)
      setTimeout(() => {
        requestAnimationFrame(captureLoop);
      }, 120);
    };

    requestAnimationFrame(captureLoop);
  };

  const endSession = async () => {
    setIsActive(false);
    stopWebcam();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reps > 0) {
      try {
        const res = await apiFetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pose_session',
            exerciseType: exercise,
            reps: reps,
            duration: seconds,
            calories: calories
          }),
        });

        if (res.ok) {
          const data = await res.json();
          alert(`Session logged! reps: ${reps}, calories: ${calories} kcal. +${reps * 5} XP added!`);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto pl-14 pr-6 py-8 md:px-10 z-10 relative">
        {/* Glow Blur */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">AI Trainer</h1>
            <p className="text-sm text-gray-400 mt-1">Real-time webcam posture verification using MediaPipe Pose models.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Exercise Selector */}
            <select
              value={exercise}
              disabled={isActive}
              onChange={(e) => setExercise(e.target.value as any)}
              className="bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-neon-green/50 disabled:opacity-50"
            >
              <option value="squat">🏋️ Squats Counter</option>
              <option value="pushup">💪 Pushups Counter</option>
            </select>

            {/* Voice toggle */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-neon-green/10 text-neon-green border-neon-green/20'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
              title={voiceEnabled ? 'Mute Voice Trainer' : 'Unmute Voice Trainer'}
            >
              {voiceEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Webcam stream viewport */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/90 border border-white/5 flex items-center justify-center shadow-lg">
              {/* Offscreen camera feed tag */}
              <video
                ref={videoRef}
                width="640"
                height="480"
                className="hidden"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width="640"
                height="480"
                className="hidden"
              />

              {/* Viewport content */}
              {processedFrame && isActive ? (
                <img
                  src={processedFrame}
                  alt="AI Feed"
                  className="w-full h-full object-cover"
                />
              ) : isActive ? (
                <div className="text-center">
                  <Activity className="w-12 h-12 text-neon-green mx-auto animate-spin mb-3" />
                  <p className="text-sm font-bold text-white">Starting Frame Processors...</p>
                  <p className="text-xs text-gray-500 mt-1">Waiting for coordinate streams</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-14 h-14 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">Trainer Camera Offline</p>
                  <p className="text-xs text-gray-500 mt-1">Ready your environment and click Start Session.</p>
                </div>
              )}

              {/* Video overlays */}
              {isActive && (
                <>
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Analyzing
                  </div>
                  
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                    formStatus.toLowerCase().includes('good')
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {formStatus}
                  </div>
                </>
              )}
            </div>

            {/* Session controller buttons */}
            <div className="flex gap-4">
              {!isActive ? (
                <button
                  onClick={startSession}
                  className="flex-1 py-4 bg-neon-green text-black font-extrabold rounded-2xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Start Session
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                >
                  <Square className="w-4 h-4 fill-white" />
                  End Session & Save Logs
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Counters & Feedback logs */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider mb-4">Active Counters</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Reps</p>
                  <p className="text-4xl font-black text-white mt-1.5">{reps}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Calories</p>
                  <p className="text-2xl font-extrabold text-neon-green mt-2">{calories} <span className="text-[10px] font-normal text-gray-500">kcal</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Time</p>
                  <p className="text-2xl font-extrabold text-white mt-2">{formatTime(seconds)}</p>
                </div>
              </div>
            </div>

            {/* AI Feedback checklist */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1 flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  AI Form Coach
                  <Activity className="w-4 h-4 text-neon-green animate-pulse" />
                </h3>

                <div className="space-y-3">
                  {feedback.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <ChevronRight className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isActive && wsConnected && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
                  <span>Stream FPS: ~8 FPS</span>
                  <span className="text-neon-green flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
                    WebSocket Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  );
}
