'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import HeartbeatLoader from '@/components/HeartbeatLoader';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Sparkles,
  Award,
  Upload,
  Calendar,
  Grid,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

interface PhotoRecord {
  _id: string;
  frontPoseUrl?: string;
  sidePoseUrl?: string;
  backPoseUrl?: string;
  aiInsights?: string;
  createdAt: string;
}

export default function ProgressPhotosPage() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStreak, setUploadStreak] = useState(0);

  // Upload fields
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // Before/after state
  const [beforePhoto, setBeforePhoto] = useState<string>('');
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchPhotos = async () => {
    try {
      const res = await apiFetch('/api/transformation/photos');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
        
        // Auto-select initial before/after photos if available
        if (data.photos && data.photos.length >= 1) {
          const sorted = [...data.photos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          // Before is the earliest uploaded front pose
          const firstWithFront = sorted.find(p => p.frontPoseUrl);
          if (firstWithFront && firstWithFront.frontPoseUrl) {
            setBeforePhoto(firstWithFront.frontPoseUrl);
          }
          
          // After is the latest uploaded front pose
          const lastWithFront = [...sorted].reverse().find(p => p.frontPoseUrl);
          if (lastWithFront && lastWithFront.frontPoseUrl) {
            setAfterPhoto(lastWithFront.frontPoseUrl);
          }
        }
      }
      
      const userRes = await apiFetch('/api/progress');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUploadStreak(userData.user?.uploadStreak || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile && !sideFile && !backFile) {
      alert('Please select at least one photo (Front, Side, or Back pose) to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (frontFile) formData.append('frontPose', frontFile);
    if (sideFile) formData.append('sidePose', sideFile);
    if (backFile) formData.append('backPose', backFile);

    try {
      const res = await apiFetch('/api/transformation/photos', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUploadStreak(data.uploadStreak);
        
        // Reset forms
        setFrontFile(null);
        setSideFile(null);
        setBackFile(null);
        
        fetchPhotos();
        alert('Photos uploaded! XP awarded and AI insights generated!');
      } else {
        const err = await res.json();
        alert(err.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Drag handler for before/after comparison slider
  const handleTouchOrMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleTouchOrMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleTouchOrMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto pl-14 pr-6 py-8 md:px-10 z-10 relative">
        {/* Neon Blurs */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-2">
              Body Transformation Tracker
              <Camera className="w-6 h-6 text-neon-green" />
            </h1>
            <p className="text-sm text-gray-400 mt-1">Upload weekly progress pictures, compare changes, and get computer vision insights.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center gap-2">
              <span className="text-xs font-bold text-neon-green">⚡ Streak: {uploadStreak} Days</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 h-[60vh] flex items-center justify-center">
            <HeartbeatLoader text="Scanning Photo Database..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Photo Upload Form & History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Uploader Card */}
              {uploading ? (
                <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-white/5 min-h-[300px]">
                  <HeartbeatLoader text="Compressing & Uploading Poses, Requesting AI Biometrics..." />
                </div>
              ) : (
                <form onSubmit={handleUpload} className="glass-panel rounded-3xl p-6 border border-white/5 space-y-5">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-2">Upload Progress Poses</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Front Pose dropzone */}
                    <div className="relative group border border-white/5 hover:border-neon-green/30 bg-white/3 hover:bg-neon-green/3 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-gray-500 group-hover:text-neon-green mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Front Pose</p>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">
                        {frontFile ? frontFile.name : 'Select JPG/PNG'}
                      </p>
                    </div>

                    {/* Side Pose dropzone */}
                    <div className="relative group border border-white/5 hover:border-neon-green/30 bg-white/3 hover:bg-neon-green/3 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSideFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-gray-500 group-hover:text-neon-green mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Side Profile</p>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">
                        {sideFile ? sideFile.name : 'Select JPG/PNG'}
                      </p>
                    </div>

                    {/* Back Pose dropzone */}
                    <div className="relative group border border-white/5 hover:border-neon-green/30 bg-white/3 hover:bg-neon-green/3 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-gray-500 group-hover:text-neon-green mx-auto mb-2" />
                      <p className="text-xs font-bold text-white">Back Pose</p>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">
                        {backFile ? backFile.name : 'Select JPG/PNG'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-neon-green text-black font-extrabold rounded-xl hover:bg-white transition-colors text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Commit Photos to Timeline (+100 XP)
                  </button>
                </form>
              )}

              {/* Before/After visual comparison Slider */}
              {beforePhoto && afterPhoto && (
                <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Before / After Slider</h3>
                  
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Before Photo (Start)</label>
                      <select
                        value={beforePhoto}
                        onChange={(e) => setBeforePhoto(e.target.value)}
                        className="w-full mt-1.5 bg-[#0d141e]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {photos.map(p => (
                          p.frontPoseUrl && <option key={`before-${p._id}`} value={p.frontPoseUrl}>Front - {new Date(p.createdAt).toLocaleDateString()}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">After Photo (Latest)</label>
                      <select
                        value={afterPhoto}
                        onChange={(e) => setAfterPhoto(e.target.value)}
                        className="w-full mt-1.5 bg-[#0d141e]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {photos.map(p => (
                          p.frontPoseUrl && <option key={`after-${p._id}`} value={p.frontPoseUrl}>Front - {new Date(p.createdAt).toLocaleDateString()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Slider Component */}
                  <div
                    ref={sliderContainerRef}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden border border-white/5 select-none cursor-ew-resize bg-black"
                  >
                    {/* Before Image (underneath) */}
                    <img
                      src={beforePhoto}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* After Image (clipped on top) */}
                    <div
                      className="absolute inset-y-0 left-0 right-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                    >
                      <img
                        src={afterPhoto}
                        alt="After"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                    </div>

                    {/* Draggable Divider Line */}
                    <div
                      className="absolute inset-y-0 w-1 bg-neon-green pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7.5 h-7.5 rounded-full bg-[#030408] border-2 border-neon-green flex items-center justify-center text-neon-green text-[10px] font-bold shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                        ↔
                      </div>
                    </div>
                    
                    {/* Label tags */}
                    <span className="absolute bottom-4 left-4 bg-black/60 text-white border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md uppercase tracking-wider">Before</span>
                    <span className="absolute bottom-4 right-4 bg-neon-green/20 text-neon-green border border-neon-green/30 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md uppercase tracking-wider">After</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: AI Insights & Historical logs list */}
            <div className="space-y-6">
              
              {/* AI Insights Card */}
              {photos.length > 0 && (
                <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-neon-green/5 to-transparent relative overflow-hidden">
                  <h3 className="font-extrabold text-sm text-neon-green uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    AI Progress Analytics
                    <Sparkles className="w-4 h-4 text-neon-green animate-pulse" />
                  </h3>
                  
                  <div className="space-y-4">
                    {photos[0].aiInsights?.split('\n').map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        {item.trim() && (
                          <>
                            <ChevronRight className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-200 leading-relaxed font-medium">{item.replace(/^[•*\s-]+/, '')}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo timeline lists */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1 min-h-[300px]">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  Timeline History
                  <Calendar className="w-4 h-4 text-gray-500" />
                </h3>
                
                {photos.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">No progress photos logged yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {photos.map((record) => (
                      <div key={record._id} className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex justify-between items-center gap-3">
                        <div>
                          <p className="text-xs font-bold text-white">{new Date(record.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                          <div className="flex gap-1.5 text-[9px] text-gray-400 mt-1 uppercase font-semibold">
                            {record.frontPoseUrl && <span className="text-neon-green">Front</span>}
                            {record.sidePoseUrl && <span className="text-neon-blue">Side</span>}
                            {record.backPoseUrl && <span className="text-white">Back</span>}
                          </div>
                        </div>
                        
                        {/* Mini Image Preview */}
                        {record.frontPoseUrl && (
                          <img
                            src={record.frontPoseUrl}
                            alt="Front preview"
                            className="w-10 h-10 rounded-lg object-cover border border-white/10"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
