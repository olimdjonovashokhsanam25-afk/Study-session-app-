import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, RotateCcw, Library, Upload, Plus, ChevronRight, Brain, Clock, TrendingUp } from 'lucide-react';

import { processStudyMaterial } from './services/gemini';

// Components
const WaveBackground = () => (
  <div className="wave-container">
    <div className="wave wave-1"></div>
    <div className="wave wave-2"></div>
    <div className="wave wave-3"></div>
    <div className="wave wave-4" style={{ bottom: '-20px', opacity: 0.2, animationDuration: '25s' }}></div>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 transition-all ${active ? 'text-ocean-light scale-110' : 'text-white/60 hover:text-white'}`}
  >
    <Icon size={24} />
    <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({ today: 0, yesterday: 0 });
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);

  useEffect(() => {
    fetchStats();
    fetchMaterials();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setMaterials(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <WaveBackground />
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-ocean-light rounded-full flex items-center justify-center shadow-lg shadow-ocean-light/20">
            <Brain className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter italic">IPANEMA STUDY</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex flex-col items-end">
            <span className="opacity-50">TODAY</span>
            <span className="text-ocean-light font-bold">{Math.round(stats.today / 60)} MIN</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="opacity-50">YESTERDAY</span>
            <span className="font-bold">{Math.round(stats.yesterday / 60)} MIN</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {selectedMaterial ? (
            <StudySession 
              material={selectedMaterial} 
              onClose={() => {
                setSelectedMaterial(null);
                fetchStats();
              }} 
            />
          ) : (
            <>
              {activeTab === 'home' && <HomeView stats={stats} />}
              {activeTab === 'study' && <StudyView onMaterialAdded={fetchMaterials} />}
              {activeTab === 'revise' && <ReviseView materials={materials} onSelect={setSelectedMaterial} />}
              {activeTab === 'library' && <LibraryView materials={materials} onSelect={setSelectedMaterial} />}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 flex gap-4 shadow-2xl">
        <NavItem icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={BookOpen} label="Study" active={activeTab === 'study'} onClick={() => setActiveTab('study')} />
        <NavItem icon={RotateCcw} label="Revise" active={activeTab === 'revise'} onClick={() => setActiveTab('revise')} />
        <NavItem icon={Library} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
      </nav>
    </div>
  );
}

const WaveProgress = ({ progress, size = 200, label }: { progress: number, size?: number, label: string }) => {
  const radius = size / 2;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg height={size} width={size} className="transform -rotate-90">
          <circle
            stroke="rgba(255,255,255,0.1)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="var(--color-ocean-light)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner Wave Graphic */}
        <div 
          className="absolute inset-4 rounded-full overflow-hidden bg-ocean-deep/50 border border-white/5"
          style={{ width: size - 32, height: size - 32 }}
        >
          <motion.div 
            className="absolute bottom-0 left-0 w-[200%] h-full bg-ocean-light/30"
            initial={{ y: '100%' }}
            animate={{ y: `${100 - progress}%` }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <div className="absolute top-0 left-0 w-full h-8 -translate-y-full">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-ocean-light/30">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,14.29,1200,52.47V0Z" />
              </svg>
            </div>
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tighter">{Math.round(progress)}%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Complete</span>
          </div>
        </div>
      </div>
      <h3 className="font-bold uppercase tracking-widest text-xs text-ocean-light">{label}</h3>
    </div>
  );
};

const HomeView = ({ stats }: { stats: any }) => {
  const dailyProgress = Math.min(100, (stats.today / (stats.dailyGoal || 3600)) * 100);
  const weeklyProgress = Math.min(100, (stats.weekly / (stats.weeklyGoal || 18000)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-16"
    >
      <div className="text-center space-y-4 py-8">
        <motion.h2 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter leading-none"
        >
          Something amazing is waiting for you today <span className="text-ocean-light italic">inside your books</span>
        </motion.h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Your personal sanctuary for deep learning and growth. Let the waves of knowledge carry you forward.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-16 py-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm">
        <WaveProgress progress={dailyProgress} label="Daily Goal" />
        <div className="hidden md:block w-px h-32 bg-white/10" />
        <WaveProgress progress={weeklyProgress} size={160} label="Weekly Goal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Clock} label="Focus Time" value={`${Math.round(stats.today / 60)}m`} sub="Today's effort" />
        <StatCard icon={TrendingUp} label="Progress" value={stats.today >= stats.yesterday ? `+${Math.round(((stats.today - stats.yesterday) / (stats.yesterday || 1)) * 100)}%` : `-${Math.round(((stats.yesterday - stats.today) / (stats.yesterday || 1)) * 100)}%`} sub="Vs yesterday" />
        <StatCard icon={Brain} label="Retained" value="84%" sub="Memory strength" />
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-ocean-light/20 rounded-xl">
        <Icon className="text-ocean-light" size={20} />
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className="text-[10px] text-ocean-light/60">{sub}</p>
    </div>
  </div>
);

const StudyView = ({ onMaterialAdded }: { onMaterialAdded: () => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleUpload = async () => {
    if (!url && !fileContent) return;
    setIsUploading(true);
    
    try {
      const result = await processStudyMaterial(url || fileContent, url ? "URL" : "Text");
      
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: url || "New Study Session",
          type: url ? "URL" : "Document",
          content: url || fileContent,
          summary: result.summary,
          questions: result.questions,
          flashcards: result.flashcards
        })
      });
      
      setUrl('');
      setFileContent('');
      onMaterialAdded();
    } catch (e) {
      console.error(e);
      alert("Failed to process material. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">New Study Session</h2>
        <p className="text-white/60">Upload your materials and let AI prepare your path.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-white/20 rounded-3xl hover:border-ocean-light hover:bg-ocean-light/5 transition-all group cursor-pointer">
              <Upload className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-center">Paste Text or Upload</span>
              <textarea 
                className="hidden" 
                onChange={(e) => setFileContent(e.target.value)}
              />
              {fileContent && <span className="text-[10px] text-ocean-light font-mono">TEXT LOADED</span>}
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1 p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col justify-center gap-4">
              <input 
                type="text" 
                placeholder="Paste URL or YouTube link..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-ocean-light transition-colors"
              />
              <button 
                onClick={handleUpload}
                disabled={isUploading || (!url && !fileContent)}
                className="bg-ocean-light text-white font-bold py-3 rounded-2xl hover:bg-ocean-mid disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <Clock className="animate-spin" size={18} /> : <Plus size={18} />}
                {isUploading ? 'Processing with AI...' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-ocean-light/10 border border-ocean-light/20 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-ocean-light">
          <Brain size={20} />
          <h3 className="font-bold uppercase tracking-widest text-xs">Study Protocol</h3>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          Every material you upload will be structured into 3 sessions. 
          To master a concept, you'll revisit it 10 times across these sessions.
        </p>
      </div>
    </motion.div>
  );
};

const ReviseView = ({ materials, onSelect }: { materials: any[], onSelect: (m: any) => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="max-w-4xl mx-auto space-y-8"
  >
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Revision Deck</h2>
        <p className="text-white/60">Revisit your learned materials to solidify memory.</p>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono opacity-50">DUE TODAY</span>
        <div className="text-2xl font-bold text-ocean-light">{materials.length * 2} CARDS</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {materials.map((m, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(m)}
          className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h3 className="font-bold text-xl line-clamp-1">{m.title}</h3>
              <p className="text-xs text-ocean-light font-bold uppercase tracking-widest">{m.type}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-ocean-light group-hover:border-ocean-light transition-all">
              <ChevronRight size={18} />
            </div>
          </div>
          <div className="flex gap-2">
            {[...Array(10)].map((_, j) => (
              <div key={j} className={`h-1 flex-1 rounded-full ${j < 3 ? 'bg-ocean-light' : 'bg-white/10'}`} />
            ))}
          </div>
          <p className="mt-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">Mastery: 30%</p>
        </div>
      ))}
      {materials.length === 0 && (
        <div className="col-span-full py-24 text-center text-white/20 italic">
          No materials to revise yet. Start by adding some in the Study tab.
        </div>
      )}
    </div>
  </motion.div>
);

const LibraryView = ({ materials, onSelect }: { materials: any[], onSelect: (m: any) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-6xl mx-auto space-y-8"
  >
    <div className="space-y-2">
      <h2 className="text-4xl font-bold tracking-tight">Your Library</h2>
      <p className="text-white/60">Access all your books, articles, and theses.</p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {materials.map((m, i) => (
        <div 
          key={i} 
          onClick={() => onSelect(m)}
          className="aspect-[3/4] bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer shadow-xl"
        >
          <div className="w-full aspect-square bg-ocean-deep rounded-lg flex items-center justify-center mb-4">
            <Library className="text-ocean-light/40" size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm line-clamp-2 leading-tight">{m.title}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{m.type}</p>
          </div>
        </div>
      ))}
      <button className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-ocean-light hover:bg-ocean-light/5 transition-all text-white/40 hover:text-ocean-light">
        <Plus size={32} />
        <span className="text-xs font-bold uppercase tracking-widest">Add New</span>
      </button>
    </div>
  </motion.div>
);

const StudySession = ({ material, onClose }: { material: any, onClose: () => void }) => {
  const [step, setStep] = useState<'summary' | 'questions' | 'flashcards'>('summary');
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flashcards = JSON.parse(material.flashcards || '[]');
  const questions = JSON.parse(material.questions || '[]');

  const handleComplete = async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_id: material.id,
          session_type: step,
          duration: 300 // Assume 5 mins for now
        })
      });
      onClose();
    } catch (e) { console.error(e); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <button onClick={onClose} className="text-white/60 hover:text-white flex items-center gap-2">
          <ChevronRight className="rotate-180" size={18} />
          Back to Library
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setStep('summary')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${step === 'summary' ? 'bg-ocean-light text-white' : 'bg-white/5 text-white/40'}`}
          >
            Summary
          </button>
          <button 
            onClick={() => setStep('questions')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${step === 'questions' ? 'bg-ocean-light text-white' : 'bg-white/5 text-white/40'}`}
          >
            Questions
          </button>
          <button 
            onClick={() => setStep('flashcards')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${step === 'flashcards' ? 'bg-ocean-light text-white' : 'bg-white/5 text-white/40'}`}
          >
            Flashcards
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-12 backdrop-blur-md min-h-[500px] flex flex-col">
        {step === 'summary' && (
          <div className="space-y-6 flex-1">
            <h2 className="text-4xl font-bold tracking-tight">{material.title}</h2>
            <div className="w-12 h-1 bg-ocean-light rounded-full" />
            <p className="text-xl text-white/80 leading-relaxed whitespace-pre-wrap">
              {material.summary}
            </p>
          </div>
        )}

        {step === 'questions' && (
          <div className="space-y-8 flex-1">
            <h2 className="text-3xl font-bold tracking-tight">Self-Assessment</h2>
            <div className="space-y-6">
              {questions.map((q: string, i: number) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-ocean-light/40 transition-all">
                  <p className="text-lg text-white/90">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'flashcards' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-12">
            <motion.div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full max-w-md aspect-[3/2] cursor-pointer perspective-1000"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div className="absolute inset-0 bg-ocean-mid rounded-3xl p-8 flex items-center justify-center text-center backface-hidden shadow-2xl">
                <p className="text-2xl font-bold">{flashcards[currentFlashcard]?.front}</p>
              </div>
              {/* Back */}
              <div 
                className="absolute inset-0 bg-ocean-light rounded-3xl p-8 flex items-center justify-center text-center backface-hidden shadow-2xl"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <p className="text-2xl font-bold">{flashcards[currentFlashcard]?.back}</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-8">
              <button 
                disabled={currentFlashcard === 0}
                onClick={() => { setCurrentFlashcard(c => c - 1); setIsFlipped(false); }}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20"
              >
                <ChevronRight className="rotate-180" />
              </button>
              <span className="font-mono text-sm opacity-50">
                {currentFlashcard + 1} / {flashcards.length}
              </span>
              <button 
                disabled={currentFlashcard === flashcards.length - 1}
                onClick={() => { setCurrentFlashcard(c => c + 1); setIsFlipped(false); }}
                className="p-4 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleComplete}
            className="bg-white text-ocean-deep font-bold px-8 py-4 rounded-2xl hover:bg-ocean-light hover:text-white transition-all flex items-center gap-2"
          >
            Complete Session
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

