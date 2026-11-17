const API_BASE = '/api';

export async function fetchScores(params = {}) {
  const query = new URLSearchParams();
  if (params.test_type && params.test_type !== 'All') query.append('test_type', params.test_type);
  if (params.topic && params.topic !== 'All') query.append('topic', params.topic);
  if (params.search) query.append('search', params.search);
  if (params.order) query.append('order', params.order);
  if (params.start_date) query.append('start_date', params.start_date);
  if (params.end_date) query.append('end_date', params.end_date);

  const res = await fetch(`${API_BASE}/scores?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json();
}

export async function createScore(data) {
  const res = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to save score');
  }
  return res.json();
}

export async function updateScore(id, data) {
  const res = await fetch(`${API_BASE}/scores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to update score');
  }
  return res.json();
}

export async function deleteScore(id) {
  const res = await fetch(`${API_BASE}/scores/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete score');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchTopics(testType) {
  const url = testType ? `${API_BASE}/topics?test_type=${encodeURIComponent(testType)}` : `${API_BASE}/topics`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchNetworkInfo() {
  const res = await fetch(`${API_BASE}/network-info`);
  if (!res.ok) throw new Error('Failed to fetch network info');
  return res.json();
}

export async function seedSampleData() {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed sample data');
  return res.json();
}

export async function importData(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to import');
  }
  return res.json();
}
