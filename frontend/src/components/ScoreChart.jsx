import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { 
  LineChart as ChartIcon, 
  Target, 
  Layers, 
  Clock, 
  Sparkles, 
  BookOpen,
  LayoutGrid,
  Check,
  Plus
} from 'lucide-react';
import { formatDate, formatDuration, getTopicBadgeStyle, getTestTypeDetails } from '../utils';

// Helper component for single chart rendering
function ProgressionLineChart({
  data = [],
  dataKey = "score",
  name = "Score",
  strokeColor = "#6366f1",
  targetScore,
  minY = 400,
  maxY = 1600,
  scaleMax = 1600,
  showSubMath = false,
  showSubRW = false,
  showTime = false,
  heightClass = "h-[280px] sm:h-[350px]"
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    const badge = getTopicBadgeStyle(item.topic);
    const typeDetails = getTestTypeDetails(item.test_type);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs space-y-2 pointer-events-none z-50">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-100 text-sm truncate">{item.name}</span>
          <span className="text-slate-400 font-mono text-[11px] shrink-0">{item.formattedDate}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${typeDetails.bg}`}>
            {typeDetails.shortLabel}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.bg}`}>
            {item.topic}
          </span>
          <span className="text-slate-400 flex items-center gap-1 text-[11px] ml-auto">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatDuration(item.time_taken_minutes)}
          </span>
        </div>

        <div className="space-y-1 pt-1 font-mono">
          <div className="flex justify-between items-center font-bold text-sm" style={{ color: strokeColor }}>
            <span>{name}:</span>
            <span>{item[dataKey]} / {scaleMax}</span>
          </div>

          {showSubMath && item.math_score !== null && item.math_score !== undefined && (
            <div className="flex justify-between items-center text-emerald-400">
              <span>Math:</span>
              <span>{item.math_score} / 800</span>
            </div>
          )}

          {showSubRW && item.rw_score !== null && item.rw_score !== undefined && (
            <div className="flex justify-between items-center text-purple-400">
              <span>Reading & Writing:</span>
              <span>{item.rw_score} / 800</span>
            </div>
          )}

          {showTime && (
            <div className="flex justify-between items-center text-amber-400">
              <span>Time Taken:</span>
              <span>{item.time_taken_minutes} mins</span>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="pt-2 border-t border-slate-800/80 text-slate-300 italic text-[11px] line-clamp-2">
            "{item.notes}"
          </div>
        )}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className={`${heightClass} flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 border border-dashed border-slate-800 rounded-xl`}>
        <ChartIcon className="w-8 h-8 text-slate-600 mb-2" />
        <p>No tests logged in this category yet.</p>
      </div>
    );
  }

  return (
    <div className={`${heightClass} w-full pt-2`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 15, right: 12, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="formattedDate"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <YAxis
            domain={[minY, maxY]}
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(val) => `${val}`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Target Goal Line */}
          {targetScore && targetScore > 0 && (
            <ReferenceLine
              y={targetScore}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Goal: ${targetScore}`,
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
          )}

          {/* Main Primary Line */}
          <Line
            type="monotone"
            dataKey={dataKey}
            name={name}
            stroke={strokeColor}
            strokeWidth={3}
            dot={{ fill: strokeColor, stroke: '#0f172a', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: strokeColor, strokeWidth: 3 }}
          />

          {/* Math Subscore Line (Full test view only) */}
          {showSubMath && (
            <Line
              type="monotone"
              dataKey="math_score"
              name="Math Subscore"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ fill: '#10b981', stroke: '#0f172a', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}

          {/* RW Subscore Line (Full test view only) */}
          {showSubRW && (
            <Line
              type="monotone"
              dataKey="rw_score"
              name="RW Subscore"
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ fill: '#a855f7', stroke: '#0f172a', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          )}

          {/* Time Taken Line */}
          {showTime && (
            <Line
              type="monotone"
              dataKey="time_taken_minutes"
              name="Time Taken (mins)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 1, r: 3.5 }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ScoreChart({ 
  scores = [], 
  topics = [], 
  onOpenAdd, 
  onSeedData 
}) {
  // Chart category: 'full' | 'math' | 'english' | 'split'
  const [chartTab, setChartTab] = useState('full');
  const [selectedTopic, setSelectedTopic] = useState('All');
  
  // Goals for each section
  const [targetFull, setTargetFull] = useState(1500);
  const [targetMath, setTargetMath] = useState(750);
  const [targetEnglish, setTargetEnglish] = useState(720);

  // Options for full test view
  const [showSubMath, setShowSubMath] = useState(true);
  const [showSubRW, setShowSubRW] = useState(true);
  const [showTime, setShowTime] = useState(false);

  // Toggles to include section scores from full tests in standalone section charts
  const [includeFullInMath, setIncludeFullInMath] = useState(true);
  const [includeFullInEnglish, setIncludeFullInEnglish] = useState(true);

  // 1. Full Tests Data (1600 scale)
  const fullChartData = useMemo(() => {
    let filtered = scores.filter((s) => (s.test_type || 'full').toLowerCase() === 'full');
    if (selectedTopic !== 'All' && chartTab === 'full') {
      filtered = filtered.filter((s) => s.topic === selectedTopic);
    }
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    return filtered.map((item, idx) => ({
      index: idx + 1,
      id: item.id,
      name: item.name,
      test_type: 'full',
      formattedDate: formatDate(item.date),
      topic: item.topic,
      score: item.score,
      math_score: item.math_score ?? null,
      rw_score: item.rw_score ?? null,
      time_taken_minutes: item.time_taken_minutes,
      notes: item.notes,
    }));
  }, [scores, selectedTopic, chartTab]);

  // 2. Math Tests Data (800 scale)
  const mathChartData = useMemo(() => {
    let list = [];
    scores.forEach((s) => {
      const type = (s.test_type || 'full').toLowerCase();
      if (type === 'math') {
        list.push({
          id: s.id,
          name: s.name,
          date: s.date,
          formattedDate: formatDate(s.date),
          test_type: 'math',
          topic: s.topic,
          score: s.score,
          math_score: s.score,
          time_taken_minutes: s.time_taken_minutes,
          notes: s.notes,
        });
      } else if (type === 'full' && includeFullInMath && s.math_score !== null && s.math_score !== undefined) {
        list.push({
          id: s.id,
          name: `${s.name} (Full SAT Math)`,
          date: s.date,
          formattedDate: formatDate(s.date),
          test_type: 'full',
          topic: `Full SAT - Math (${s.topic})`,
          score: s.math_score,
          math_score: s.math_score,
          time_taken_minutes: s.time_taken_minutes,
          notes: s.notes,
        });
      }
    });

    if (selectedTopic !== 'All' && chartTab === 'math') {
      list = list.filter((s) => s.topic === selectedTopic);
    }

    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    return list;
  }, [scores, includeFullInMath, selectedTopic, chartTab]);

  // 3. English / RW Tests Data (800 scale)
  const englishChartData = useMemo(() => {
    let list = [];
    scores.forEach((s) => {
      const type = (s.test_type || 'full').toLowerCase();
      if (type === 'english') {
        list.push({
          id: s.id,
          name: s.name,
          date: s.date,
          formattedDate: formatDate(s.date),
          test_type: 'english',
          topic: s.topic,
          score: s.score,
          rw_score: s.score,
          time_taken_minutes: s.time_taken_minutes,
          notes: s.notes,
        });
      } else if (type === 'full' && includeFullInEnglish && s.rw_score !== null && s.rw_score !== undefined) {
        list.push({
          id: s.id,
          name: `${s.name} (Full SAT RW)`,
          date: s.date,
          formattedDate: formatDate(s.date),
          test_type: 'full',
          topic: `Full SAT - RW (${s.topic})`,
          score: s.rw_score,
          rw_score: s.rw_score,
          time_taken_minutes: s.time_taken_minutes,
          notes: s.notes,
        });
      }
    });

    if (selectedTopic !== 'All' && chartTab === 'english') {
      list = list.filter((s) => s.topic === selectedTopic);
    }

    list.sort((a, b) => new Date(a.date) - new Date(b.date));
    return list;
  }, [scores, includeFullInEnglish, selectedTopic, chartTab]);

  // Y-axis bounds calculators
  const fullMinY = useMemo(() => {
    if (fullChartData.length === 0) return 600;
    const vals = fullChartData.map((d) => d.score);
    return Math.max(0, Math.floor(Math.min(...vals) / 100) * 100 - 100);
  }, [fullChartData]);

  const fullMaxY = useMemo(() => {
    if (fullChartData.length === 0) return 1600;
    const vals = fullChartData.map((d) => d.score);
    return Math.min(1600, Math.ceil(Math.max(...vals, targetFull) / 100) * 100 + 40);
  }, [fullChartData, targetFull]);

  const mathMinY = useMemo(() => {
    if (mathChartData.length === 0) return 400;
    const vals = mathChartData.map((d) => d.score);
    return Math.max(0, Math.floor(Math.min(...vals) / 50) * 50 - 50);
  }, [mathChartData]);

  const mathMaxY = useMemo(() => {
    if (mathChartData.length === 0) return 800;
    const vals = mathChartData.map((d) => d.score);
    return Math.min(800, Math.ceil(Math.max(...vals, targetMath) / 50) * 50 + 20);
  }, [mathChartData, targetMath]);

  const englishMinY = useMemo(() => {
    if (englishChartData.length === 0) return 400;
    const vals = englishChartData.map((d) => d.score);
    return Math.max(0, Math.floor(Math.min(...vals) / 50) * 50 - 50);
  }, [englishChartData]);

  const englishMaxY = useMemo(() => {
    if (englishChartData.length === 0) return 800;
    const vals = englishChartData.map((d) => d.score);
    return Math.min(800, Math.ceil(Math.max(...vals, targetEnglish) / 50) * 50 + 20);
  }, [englishChartData, targetEnglish]);

  if (scores.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <ChartIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">No practice tests logged yet</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
            Log your math tests, english drills, or full practice tests to graph them separately.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAdd && onOpenAdd('full')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            + Log Score
          </button>
          <button
            onClick={onSeedData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Seed Sample Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Top Header with Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Score Progression Graphs</h2>
              <p className="text-xs text-slate-400">
                Graph Full SAT, Math, and English tests separately with dedicated scales
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Mode Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => { setChartTab('full'); setSelectedTopic('All'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              chartTab === 'full'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯 Full Tests</span>
            <span className="text-[10px] opacity-75 font-mono">(1600)</span>
          </button>

          <button
            onClick={() => { setChartTab('math'); setSelectedTopic('All'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              chartTab === 'math'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📐 Math</span>
            <span className="text-[10px] opacity-75 font-mono">(800)</span>
          </button>

          <button
            onClick={() => { setChartTab('english'); setSelectedTopic('All'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              chartTab === 'english'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📖 English / RW</span>
            <span className="text-[10px] opacity-75 font-mono">(800)</span>
          </button>

          <button
            onClick={() => { setChartTab('split'); setSelectedTopic('All'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              chartTab === 'split'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All 3 Separate</span>
          </button>
        </div>
      </div>

      {/* Granular Controls Bar (Specific to selected tab) */}
      {chartTab !== 'split' && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          {/* Left: Toggles & Details */}
          <div className="flex flex-wrap items-center gap-2">
            {chartTab === 'full' && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Full SAT (1600)
                </span>

                <button
                  onClick={() => setShowSubMath(!showSubMath)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    showSubMath
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showSubMath ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  Math Subscore
                </button>

                <button
                  onClick={() => setShowSubRW(!showSubRW)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    showSubRW
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showSubRW ? 'bg-purple-400' : 'bg-slate-600'}`} />
                  Reading & Writing Subscore
                </button>
              </>
            )}

            {chartTab === 'math' && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Math Scores (800 Scale)
                </span>

                <button
                  onClick={() => setIncludeFullInMath(!includeFullInMath)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    includeFullInMath
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Check className={`w-3 h-3 ${includeFullInMath ? 'text-blue-400' : 'text-slate-600'}`} />
                  Include Math from Full Tests
                </button>
              </>
            )}

            {chartTab === 'english' && (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Reading & Writing Scores (800 Scale)
                </span>

                <button
                  onClick={() => setIncludeFullInEnglish(!includeFullInEnglish)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    includeFullInEnglish
                      ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Check className={`w-3 h-3 ${includeFullInEnglish ? 'text-blue-400' : 'text-slate-600'}`} />
                  Include RW from Full Tests
                </button>
              </>
            )}

            <button
              onClick={() => setShowTime(!showTime)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                showTime
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <Clock className="w-3 h-3" />
              Time
            </button>
          </div>

          {/* Right: Goal Input & Topic Filter */}
          <div className="flex items-center gap-2">
            {/* Target Goal Input */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Goal:</span>
              <input
                type="number"
                min="200"
                max={chartTab === 'full' ? 1600 : 800}
                step="10"
                value={chartTab === 'full' ? targetFull : chartTab === 'math' ? targetMath : targetEnglish}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (chartTab === 'full') setTargetFull(val);
                  else if (chartTab === 'math') setTargetMath(val);
                  else setTargetEnglish(val);
                }}
                className="w-14 bg-transparent font-mono font-bold text-amber-300 focus:outline-none"
              />
            </div>

            {/* Topic Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="All" className="bg-slate-900">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Render Chart Content Based on Selected Tab */}
      {chartTab === 'full' && (
        <div>
          <ProgressionLineChart
            data={fullChartData}
            dataKey="score"
            name="Full SAT Score"
            strokeColor="#6366f1"
            targetScore={targetFull}
            minY={fullMinY}
            maxY={fullMaxY}
            scaleMax={1600}
            showSubMath={showSubMath}
            showSubRW={showSubRW}
            showTime={showTime}
            heightClass="h-[300px] sm:h-[380px]"
          />
          {fullChartData.length === 0 && (
            <div className="text-center pt-2">
              <button
                onClick={() => onOpenAdd && onOpenAdd('full')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log a Full Test Score
              </button>
            </div>
          )}
        </div>
      )}

      {chartTab === 'math' && (
        <div>
          <ProgressionLineChart
            data={mathChartData}
            dataKey="score"
            name="Math Score"
            strokeColor="#10b981"
            targetScore={targetMath}
            minY={mathMinY}
            maxY={mathMaxY}
            scaleMax={800}
            showTime={showTime}
            heightClass="h-[300px] sm:h-[380px]"
          />
          {mathChartData.length === 0 && (
            <div className="text-center pt-2">
              <button
                onClick={() => onOpenAdd && onOpenAdd('math')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log a Math Practice Test
              </button>
            </div>
          )}
        </div>
      )}

      {chartTab === 'english' && (
        <div>
          <ProgressionLineChart
            data={englishChartData}
            dataKey="score"
            name="Reading & Writing Score"
            strokeColor="#a855f7"
            targetScore={targetEnglish}
            minY={englishMinY}
            maxY={englishMaxY}
            scaleMax={800}
            showTime={showTime}
            heightClass="h-[300px] sm:h-[380px]"
          />
          {englishChartData.length === 0 && (
            <div className="text-center pt-2">
              <button
                onClick={() => onOpenAdd && onOpenAdd('english')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log an English / Reading & Writing Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* Split Mode: All 3 Separate Graphs on one screen */}
      {chartTab === 'split' && (
        <div className="space-y-6 pt-2">
          {/* 1. Full SAT Graph */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-sm font-bold text-slate-100">Full SAT Tests (1600 Scale)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {fullChartData.length} test{fullChartData.length === 1 ? '' : 's'}
              </span>
            </div>
            <ProgressionLineChart
              data={fullChartData}
              dataKey="score"
              name="Full SAT Score"
              strokeColor="#6366f1"
              targetScore={targetFull}
              minY={fullMinY}
              maxY={fullMaxY}
              scaleMax={1600}
              showSubMath={true}
              showSubRW={true}
              heightClass="h-[240px]"
            />
          </div>

          {/* 2. Math & English Graphs Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Math Graph */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-100">Math Progression (800 Scale)</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {mathChartData.length} entry{mathChartData.length === 1 ? '' : 'ies'}
                </span>
              </div>
              <ProgressionLineChart
                data={mathChartData}
                dataKey="score"
                name="Math Score"
                strokeColor="#10b981"
                targetScore={targetMath}
                minY={mathMinY}
                maxY={mathMaxY}
                scaleMax={800}
                heightClass="h-[220px]"
              />
            </div>

            {/* English Graph */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h3 className="text-sm font-bold text-slate-100">English / RW Progression (800 Scale)</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {englishChartData.length} entry{englishChartData.length === 1 ? '' : 'ies'}
                </span>
              </div>
              <ProgressionLineChart
                data={englishChartData}
                dataKey="score"
                name="Reading & Writing"
                strokeColor="#a855f7"
                targetScore={targetEnglish}
                minY={englishMinY}
                maxY={englishMaxY}
                scaleMax={800}
                heightClass="h-[220px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}