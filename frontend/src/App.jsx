import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchScores, 
  fetchStats, 
  fetchTopics, 
  createScore, 
  updateScore, 
  deleteScore, 
  seedSampleData, 
  importData 
} from './api';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import ScoreChart from './components/ScoreChart';
import ScoreList from './components/ScoreList';
import ScoreFormModal from './components/ScoreFormModal';
import NetworkModal from './components/NetworkModal';
import { Plus, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [initialFormTestType, setInitialFormTestType] = useState('full');
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAdd = (type = 'full') => {
    setEditingScore(null);
    setInitialFormTestType(type);
    setIsFormOpen(true);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [scoresData, statsData, topicsData] = await Promise.all([
        fetchScores({ order: 'ASC' }),
        fetchStats(),
        fetchTopics(),
      ]);
      setScores(scoresData);
      setStats(statsData);
      setTopics(topicsData);
    } catch (err) {
      console.error('Failed to load tracker data:', err);
      showToast('Error connecting to backend database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveScore = async (scoreData) => {
    try {
      if (editingScore) {
        await updateScore(editingScore.id, scoreData);
        showToast(`Updated "${scoreData.name}" successfully!`);
      } else {
        await createScore(scoreData);
        showToast(`Logged score for "${scoreData.name}"!`);
      }
      setIsFormOpen(false);
      setEditingScore(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save score', 'error');
    }
  };

  const handleDeleteScore = async (id) => {
    try {
      await deleteScore(id);
      showToast('Practice test entry deleted');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete test', 'error');
    }
  };

  const handleSeedData = async () => {
    try {
      await seedSampleData();
      showToast('Loaded realistic SAT practice sample tests!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast('Failed to seed sample tests', 'error');
    }
  };

  const handleExport = () => {
    window.location.href = '/api/export';
  };

  const handleImport = async (file) => {
    try {
      const res = await importData(file);
      showToast(res.message || 'Backup imported successfully!');
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to import backup', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 sm:pb-8">
      {/* Navbar */}
      <Navbar
        onOpenAdd={() => handleOpenAdd('full')}
        onOpenNetwork={() => setIsNetworkModalOpen(true)}
        onSeedData={handleSeedData}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <p className="text-sm">Connecting to SAT Tracker server...</p>
          </div>
        ) : (
          <>
            {/* Top KPI Cards */}
            <StatsOverview stats={stats} />

            {/* Line Graph Section */}
            <ScoreChart
              scores={scores}
              topics={topics}
              onOpenAdd={handleOpenAdd}
              onSeedData={handleSeedData}
            />

            {/* Practice Test Table / Mobile Cards */}
            <ScoreList
              scores={scores}
              topics={topics}
              onEdit={(score) => {
                setEditingScore(score);
                setInitialFormTestType(score.test_type || 'full');
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteScore}
            />
          </>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => handleOpenAdd('full')}
        className="md:hidden fixed bottom-5 right-5 z-40 p-4 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 active:scale-90 transition cursor-pointer"
        aria-label="Add score"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Add / Edit Score Modal */}
      <ScoreFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingScore(null);
        }}
        onSave={handleSaveScore}
        editingScore={editingScore}
        allTopics={topics}
        initialTestType={initialFormTestType}
      />

      {/* Network / Mobile Pairing Modal */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs sm:text-sm font-medium animate-slide-up">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-slate-200">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
