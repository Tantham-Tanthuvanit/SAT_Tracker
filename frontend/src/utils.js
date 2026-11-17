export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function getTestTypeDetails(type = 'full') {
  const t = (type || 'full').toLowerCase();
  if (t === 'math') {
    return {
      type: 'math',
      label: 'Math Test',
      shortLabel: 'Math',
      maxScore: 800,
      scaleLabel: '800 Max',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      pillActive: 'bg-emerald-600 text-white shadow-emerald-600/30',
      color: '#10b981'
    };
  }
  if (t === 'english' || t === 'rw' || t === 'reading & writing') {
    return {
      type: 'english',
      label: 'English / RW Test',
      shortLabel: 'English',
      maxScore: 800,
      scaleLabel: '800 Max',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      pillActive: 'bg-purple-600 text-white shadow-purple-600/30',
      color: '#a855f7'
    };
  }
  return {
    type: 'full',
    label: 'Full SAT Test',
    shortLabel: 'Full Test',
    maxScore: 1600,
    scaleLabel: '1600 Max',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    pillActive: 'bg-indigo-600 text-white shadow-indigo-600/30',
    color: '#6366f1'
  };
}

export function getTopicBadgeStyle(topic = '') {
  const t = (topic || '').toLowerCase();
  if (t.includes('full test') || t.includes('bluebook') || t.includes('official practice')) {
    return {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
      label: 'Full Test'
    };
  }
  if (t.includes('math')) {
    return {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'Math'
    };
  }
  if (t.includes('reading') || t.includes('writing') || t.includes('rw') || t.includes('english')) {
    return {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400',
      label: 'Reading & Writing'
    };
  }
  return {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Practice Drill'
  };
}

export function getScoreBadgeStyle(score, testType = 'full') {
  const isSection = testType === 'math' || testType === 'english';
  if (isSection) {
    if (score >= 750) {
      return 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10';
    }
    if (score >= 700) {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    }
    if (score >= 600) {
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
    if (score >= 500) {
      return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
    }
    return 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
  }

  if (score >= 1500) {
    return 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10';
  }
  if (score >= 1400) {
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  }
  if (score >= 1200) {
    return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
  }
  if (score >= 1000) {
    return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
  }
  return 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
}
