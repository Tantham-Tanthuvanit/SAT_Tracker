import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Clock, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  X,
  Layers
} from 'lucide-react';
import { formatDate, formatDuration, getTopicBadgeStyle, getScoreBadgeStyle, getTestTypeDetails } from '../utils';

export default function ScoreList({ scores = [], topics = [], onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});

  // Filter and sort scores
  const filteredScores = useMemo(() => {
    let result = [...scores];

    // Type filter
    if (selectedType !== 'All') {
      result = result.filter((s) => (s.test_type || 'full').toLowerCase() === selectedType.toLowerCase());
    }

    // Topic filter
    if (selectedTopic !== 'All') {
      result = result.filter((s) => s.topic === selectedTopic);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.topic.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'score-desc') return b.score - a.score;
      if (sortBy === 'score-asc') return a.score - b.score;
      if (sortBy === 'time-desc') return b.time_taken_minutes - a.time_taken_minutes;
      return 0;
    });

    return result;
  }, [scores, selectedType, selectedTopic, search, sortBy]);

  const toggleNote = (id) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Practice Test History</h2>
            <p className="text-xs text-slate-400">
              {filteredScores.length} of {scores.length} test{scores.length === 1 ? '' : 's'} shown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Test Type Filter */}
            <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="All" className="bg-slate-900">All Types</option>
                <option value="full" className="bg-slate-900">🎯 Full Tests</option>
                <option value="math" className="bg-slate-900">📐 Math Tests</option>
                <option value="english" className="bg-slate-900">📖 English Tests</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="All" className="bg-slate-900">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="date-desc" className="bg-slate-900">Newest Date</option>
                <option value="date-asc" className="bg-slate-900">Oldest Date</option>
                <option value="score-desc" className="bg-slate-900">Highest Score</option>
                <option value="score-asc" className="bg-slate-900">Lowest Score</option>
                <option value="time-desc" className="bg-slate-900">Longest Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content: Empty state or Table / Mobile Cards */}
      {filteredScores.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No practice tests found matching your search or filters.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Test Name</th>
                  <th className="py-3 px-4 font-semibold">Topic / Section</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Time Taken</th>
                  <th className="py-3 px-4 font-semibold">Notes & Review</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredScores.map((item) => {
                  const typeDetails = getTestTypeDetails(item.test_type);
                  const badge = getTopicBadgeStyle(item.topic);
                  const scoreClass = getScoreBadgeStyle(item.score, item.test_type);
                  return (
                    <tr key={item.id} className="hover:bg-slate-850/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${typeDetails.bg}`}>
                          {typeDetails.shortLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-100 max-w-[200px] truncate">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.bg}`}>
                          {item.topic}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${scoreClass}`}>
                            {item.score}
                            <span className="text-[10px] opacity-75 font-normal ml-0.5">/{typeDetails.maxScore}</span>
                          </span>
                          {(item.test_type || 'full') === 'full' && (item.math_score !== null || item.rw_score !== null) && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.math_score ? `M:${item.math_score} ` : ''}
                              {item.rw_score ? `RW:${item.rw_score}` : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDuration(item.time_taken_minutes)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        {item.notes ? (
                          <div className="text-slate-400 italic text-[11px] truncate" title={item.notes}>
                            {item.notes}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
                            title="Edit entry"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {filteredScores.map((item) => {
              const typeDetails = getTestTypeDetails(item.test_type);
              const badge = getTopicBadgeStyle(item.topic);
              const scoreClass = getScoreBadgeStyle(item.score, item.test_type);
              const isExpanded = !!expandedNotes[item.id];

              return (
                <div key={item.id} className="p-4 space-y-2.5 hover:bg-slate-850/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeDetails.bg}`}>
                          {typeDetails.shortLabel}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDate(item.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDuration(item.time_taken_minutes)}
                        </span>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div className="text-right shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-sm inline-block ${scoreClass}`}>
                        {item.score}
                        <span className="text-[10px] opacity-75 font-normal ml-0.5">/{typeDetails.maxScore}</span>
                      </span>
                      {(item.test_type || 'full') === 'full' && (item.math_score !== null || item.rw_score !== null) && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.math_score ? `M:${item.math_score} ` : ''}
                          {item.rw_score ? `RW:${item.rw_score}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.bg}`}>
                      {item.topic}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium rounded-lg bg-indigo-500/10 border border-indigo-500/20 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 font-medium rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="pt-1">
                      <div
                        onClick={() => toggleNote(item.id)}
                        className="text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70 cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-0.5">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-indigo-400" />
                            Mistakes & Notes
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </div>
                        <p className={`italic text-slate-300 text-xs ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {item.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Delete Test Entry?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition cursor-pointer"
              >
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}