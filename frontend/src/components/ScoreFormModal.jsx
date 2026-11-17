import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Calculator, BookOpen, Calendar, FileText, Check, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

const FULL_TOPICS_DEFAULT = [
  "Full Test",
  "College Board Bluebook",
  "Official Practice Test",
  "Paper SAT Practice Test"
];

const MATH_TOPICS_DEFAULT = [
  "Math (Full Section)",
  "Math - Algebra",
  "Math - Advanced Math",
  "Math - Problem Solving & Data Analysis",
  "Math - Geometry & Trigonometry"
];

const ENGLISH_TOPICS_DEFAULT = [
  "Reading & Writing (Full Section)",
  "Reading & Writing - Craft & Structure",
  "Reading & Writing - Information & Ideas",
  "Reading & Writing - Standard English Conventions",
  "Reading & Writing - Expression of Ideas"
];

const TIME_PRESETS_BY_TYPE = {
  full: [
    { label: '134m Digital SAT', minutes: 134 },
    { label: '180m Paper SAT', minutes: 180 },
    { label: '60m Drill', minutes: 60 },
  ],
  math: [
    { label: '35m Drill', minutes: 35 },
    { label: '45m Practice', minutes: 45 },
    { label: '64m Full Math', minutes: 64 },
  ],
  english: [
    { label: '35m Drill', minutes: 35 },
    { label: '45m Practice', minutes: 45 },
    { label: '64m Full R&W', minutes: 64 },
  ]
};

export default function ScoreFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingScore, 
  allTopics = [],
  initialTestType = 'full'
}) {
  const [testType, setTestType] = useState('full');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [topic, setTopic] = useState('Full Test');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [score, setScore] = useState('');
  const [mathScore, setMathScore] = useState('');
  const [rwScore, setRwScore] = useState('');
  const [timeTaken, setTimeTaken] = useState(134);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Active topic options based on chosen testType
  const activeTopicPresets = React.useMemo(() => {
    if (testType === 'math') return MATH_TOPICS_DEFAULT;
    if (testType === 'english') return ENGLISH_TOPICS_DEFAULT;
    return FULL_TOPICS_DEFAULT;
  }, [testType]);

  const combinedTopics = React.useMemo(() => {
    return Array.from(new Set([...activeTopicPresets, ...allTopics]));
  }, [activeTopicPresets, allTopics]);

  useEffect(() => {
    if (editingScore) {
      const type = (editingScore.test_type || 'full').toLowerCase();
      setTestType(type);
      setName(editingScore.name || '');
      setDate(editingScore.date || '');
      
      const isKnownTopic = [...FULL_TOPICS_DEFAULT, ...MATH_TOPICS_DEFAULT, ...ENGLISH_TOPICS_DEFAULT, ...allTopics].includes(editingScore.topic);
      if (isKnownTopic) {
        setTopic(editingScore.topic);
        setIsCustomTopic(false);
      } else {
        setIsCustomTopic(true);
        setCustomTopic(editingScore.topic || '');
        setTopic('custom');
      }

      setScore(editingScore.score?.toString() || '');
      setMathScore(editingScore.math_score?.toString() || '');
      setRwScore(editingScore.rw_score?.toString() || '');
      setTimeTaken(editingScore.time_taken_minutes || 60);
      setNotes(editingScore.notes || '');
    } else {
      // Default new entry
      const chosenType = (initialTestType || 'full').toLowerCase();
      setTestType(chosenType);
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setDate(today);
      if (chosenType === 'math') {
        setTopic('Math (Full Section)');
        setTimeTaken(64);
      } else if (chosenType === 'english') {
        setTopic('Reading & Writing (Full Section)');
        setTimeTaken(64);
      } else {
        setTopic('Full Test');
        setTimeTaken(134);
      }
      setIsCustomTopic(false);
      setCustomTopic('');
      setScore('');
      setMathScore('');
      setRwScore('');
      setNotes('');
    }
    setError('');
  }, [editingScore, isOpen, initialTestType]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    setTestType(newType);
    setIsCustomTopic(false);
    setCustomTopic('');
    if (newType === 'math') {
      setTopic('Math (Full Section)');
      setTimeTaken(64);
      // If score is set from before and was over 800, reset it
      if (parseInt(score, 10) > 800) setScore('');
    } else if (newType === 'english') {
      setTopic('Reading & Writing (Full Section)');
      setTimeTaken(64);
      if (parseInt(score, 10) > 800) setScore('');
    } else {
      setTopic('Full Test');
      setTimeTaken(134);
    }
  };

  const handleAutoSum = () => {
    const m = parseInt(mathScore, 10);
    const rw = parseInt(rwScore, 10);
    if (!isNaN(m) && !isNaN(rw)) {
      setScore((m + rw).toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a name for this practice test');
      return;
    }

    if (!date) {
      setError('Please select a test date');
      return;
    }

    const finalTopic = isCustomTopic ? customTopic.trim() : topic;
    if (!finalTopic) {
      setError('Please select or specify a topic');
      return;
    }

    const numScore = parseInt(score, 10);
    const maxAllowed = testType === 'full' ? 1600 : 800;

    if (isNaN(numScore) || numScore < 0 || numScore > maxAllowed) {
      setError(`Score must be between 0 and ${maxAllowed} for ${testType === 'full' ? 'a Full SAT Test' : testType.toUpperCase()}`);
      return;
    }

    const numTime = parseInt(timeTaken, 10);
    if (isNaN(numTime) || numTime <= 0) {
      setError('Time taken must be greater than 0 minutes');
      return;
    }

    let parsedMath = null;
    let parsedRw = null;

    if (testType === 'full') {
      if (mathScore !== '') {
        parsedMath = parseInt(mathScore, 10);
        if (isNaN(parsedMath) || parsedMath < 0 || parsedMath > 800) {
          setError('Math sub-score must be between 0 and 800');
          return;
        }
      }
      if (rwScore !== '') {
        parsedRw = parseInt(rwScore, 10);
        if (isNaN(parsedRw) || parsedRw < 0 || parsedRw > 800) {
          setError('Reading & Writing sub-score must be between 0 and 800');
          return;
        }
      }
    } else if (testType === 'math') {
      parsedMath = numScore;
      parsedRw = null;
    } else if (testType === 'english') {
      parsedRw = numScore;
      parsedMath = null;
    }

    // Trigger celebration
    if ((testType === 'full' && numScore >= 1500) || (testType !== 'full' && numScore >= 750)) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
    }

    onSave({
      name: name.trim(),
      date,
      test_type: testType,
      topic: finalTopic,
      score: numScore,
      math_score: parsedMath,
      rw_score: parsedRw,
      time_taken_minutes: numTime,
      notes: notes.trim(),
    });
  };

  const currentPresets = TIME_PRESETS_BY_TYPE[testType] || TIME_PRESETS_BY_TYPE.full;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              testType === 'math' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : testType === 'english'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-100">
                {editingScore ? 'Edit Test Entry' : 'Log Practice Score'}
              </h3>
              <p className="text-xs text-slate-400">
                Record score, test type, section details, and time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Test Type Segmented Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Test Type *
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('full')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  testType === 'full'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎯 Full Test</span>
                <span className="text-[10px] opacity-75 font-mono">(1600)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('math')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  testType === 'math'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📐 Math</span>
                <span className="text-[10px] opacity-75 font-mono">(800)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('english')}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  testType === 'english'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📖 English / RW</span>
                <span className="text-[10px] opacity-75 font-mono">(800)</span>
              </button>
            </div>
          </div>

          {/* Test Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Practice Test Name *
            </label>
            <input
              type="text"
              required
              placeholder={
                testType === 'full' 
                  ? 'e.g. College Board Bluebook Test #5' 
                  : testType === 'math'
                  ? 'e.g. UWorld Math Module 2 Drill'
                  : 'e.g. Khan Academy Reading & Writing Drill'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Date & Topic Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Test Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Topic / Section *
              </label>
              <select
                value={isCustomTopic ? 'custom' : topic}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomTopic(true);
                  } else {
                    setIsCustomTopic(false);
                    setTopic(e.target.value);
                  }
                }}
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                {combinedTopics.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
                <option value="custom" className="bg-slate-900 font-bold">+ Custom Topic...</option>
              </select>
            </div>
          </div>

          {/* Custom Topic Input if selected */}
          {isCustomTopic && (
            <div>
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                Custom Topic Name
              </label>
              <input
                type="text"
                placeholder="e.g. Erica Meltzer Transitions Drill"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full bg-slate-950 px-3.5 py-2 rounded-xl border border-indigo-500/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
              />
            </div>
          )}

          {/* Score Input Card tailored by Test Type */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {testType === 'full' ? 'SAT Full Test Score' : `${testType.toUpperCase()} Section Score`}
              </span>
              {testType === 'full' && mathScore && rwScore && (
                <button
                  type="button"
                  onClick={handleAutoSum}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  Auto-sum ({parseInt(mathScore || 0) + parseInt(rwScore || 0)})
                </button>
              )}
            </div>

            {testType === 'full' ? (
              // Full Test: Total Score + Math & RW subscores
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-indigo-300 font-bold mb-1">
                    Total Score (0–1600) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="1600"
                    step="10"
                    placeholder="e.g. 1450"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-indigo-500/40 font-mono text-base font-bold text-indigo-300 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-emerald-400 font-semibold mb-1">
                    Math (200–800)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="800"
                    step="10"
                    placeholder="e.g. 740"
                    value={mathScore}
                    onChange={(e) => setMathScore(e.target.value)}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-purple-400 font-semibold mb-1">
                    Reading & Writing (200–800)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="800"
                    step="10"
                    placeholder="e.g. 710"
                    value={rwScore}
                    onChange={(e) => setRwScore(e.target.value)}
                    className="w-full bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono text-sm text-purple-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ) : testType === 'math' ? (
              // Math Test: single clear 200-800 input
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1.5">
                  Math Score (0–800) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    min="0"
                    max="800"
                    step="10"
                    placeholder="e.g. 720"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-48 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-emerald-500/50 font-mono text-xl font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                  />
                  <div className="text-xs text-slate-400">
                    <p className="font-medium text-slate-300">SAT Math Section scale: 200–800</p>
                    <p className="text-[11px] text-slate-500">Will be graphed on your dedicated Math chart</p>
                  </div>
                </div>
              </div>
            ) : (
              // English Test: single clear 200-800 input
              <div>
                <label className="block text-xs font-bold text-purple-400 mb-1.5">
                  Reading & Writing Score (0–800) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    min="0"
                    max="800"
                    step="10"
                    placeholder="e.g. 680"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-48 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-purple-500/50 font-mono text-xl font-bold text-purple-400 focus:outline-none focus:border-purple-400"
                  />
                  <div className="text-xs text-slate-400">
                    <p className="font-medium text-slate-300">SAT Reading & Writing scale: 200–800</p>
                    <p className="text-[11px] text-slate-500">Will be graphed on your dedicated English chart</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Taken */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Time Taken (Minutes) *
              </label>
              <span className="text-xs font-mono text-amber-400">
                {timeTaken ? `${Math.floor(timeTaken / 60)}h ${timeTaken % 60}m` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                min="1"
                max="600"
                value={timeTaken}
                onChange={(e) => setTimeTaken(e.target.value)}
                className="w-28 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex flex-wrap items-center gap-1.5">
                {currentPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTimeTaken(preset.minutes)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      Number(timeTaken) === preset.minutes
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes & Review */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes & Mistakes Review (Optional)
            </label>
            <textarea
              rows={3}
              placeholder={
                testType === 'math'
                  ? 'Formulas to review, pacing in Module 2, Desmos tricks...'
                  : testType === 'english'
                  ? 'Words in context notes, grammar rules, transition words...'
                  : 'Mistakes on Module 2 Math, pacing notes, things to review...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white shadow-lg transition cursor-pointer active:scale-95 ${
                testType === 'math'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : testType === 'english'
                  ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {editingScore ? 'Save Changes' : `Log ${testType === 'full' ? 'Full Test' : testType === 'math' ? 'Math Score' : 'English Score'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}