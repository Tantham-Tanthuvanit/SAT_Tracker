import React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  BookOpen, 
  Target, 
  Calculator, 
  PenTool,
  Sparkles
} from 'lucide-react';
import { formatDuration } from '../utils';

export default function StatsOverview({ stats }) {
  if (!stats || stats.total_tests === 0) {
    return null;
  }

  const {
    total_tests,
    highest_score,
    latest_score,
    average_score,
    total_time_minutes,
    score_change,
    highest_math,
    highest_rw,
    by_type = {}
  } = stats;

  const fullStats = by_type.full;
  const mathStats = by_type.math;
  const englishStats = by_type.english;

  return (
    <div className="space-y-4">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Full SAT Personal Best */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 border border-indigo-500/25 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition">
            <Trophy className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Full SAT Best</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {highest_score || '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 1600</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {fullStats ? `${fullStats.count} full test${fullStats.count === 1 ? '' : 's'} logged` : 'Scale 400–1600'}
          </p>
        </div>

        {/* Math Best */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/25 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition">
            <Calculator className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <Calculator className="w-4 h-4 shrink-0" />
            <span>Math Best</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {highest_math || '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 800</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {mathStats ? `${mathStats.count} section test${mathStats.count === 1 ? '' : 's'} logged` : 'Scale 200–800'}
          </p>
        </div>

        {/* English Best */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900 border border-purple-500/25 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition">
            <PenTool className="w-16 h-16 text-purple-400" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <PenTool className="w-4 h-4 shrink-0" />
            <span>English / RW Best</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {highest_rw || '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 800</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {englishStats ? `${englishStats.count} section test${englishStats.count === 1 ? '' : 's'} logged` : 'Scale 200–800'}
          </p>
        </div>

        {/* Superscore or Practice Time */}
        {highest_math && highest_rw ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/25 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-25 transition">
              <Sparkles className="w-16 h-16 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Superscore</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {highest_math + highest_rw}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 1600</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Math {highest_math} + English {highest_rw}</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Time Practiced</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {formatDuration(total_time_minutes)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{total_tests} tests completed</p>
          </div>
        )}
      </div>

      {/* Secondary Bar: Latest score & Total Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Practice: <strong className="text-slate-200">{formatDuration(total_time_minutes)}</strong></span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Total Logged: <strong className="text-slate-200">{total_tests}</strong>
          </span>
        </div>

        {latest_score !== null && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Latest Full Score:</span>
            <span className="font-mono font-bold text-slate-200">{latest_score}</span>
            {score_change !== null && score_change !== undefined && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                score_change >= 0 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {score_change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {score_change >= 0 ? `+${score_change}` : score_change}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}