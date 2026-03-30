const BASE_URL = 'http://192.168.1.122/face_api/';

const EMOJI_MAP = {
  'Excellent': { emoji: '😍', color: '#007AFF', bg: '#EBF4FF' },
  'Good': { emoji: '🙂', color: '#34C759', bg: '#EDFFF2' },
  'Average': { emoji: '😐', color: '#FFCC00', bg: '#FFFBEC' },
  'Poor': { emoji: '🙁', color: '#FF9500', bg: '#FFF6EC' },
  'Very Poor': { emoji: '☹️', color: '#FF3B30', bg: '#FFF0EF' },
};

export async function getReactTypes(baseUrl = BASE_URL) {
  const response = await fetch(`${baseUrl}/get_react_types.php`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.message || 'Failed to load emojis');

  return json.data.map((row) => {
    const mapped = EMOJI_MAP[row.type] ?? { emoji: '😶', color: '#8E8E93', bg: '#F5F5F5' };
    return {
      id: row.id,
      label: row.type,
      emoji: mapped.emoji,
      color: mapped.color,
      bg: mapped.bg,
      sinhalaLabel: row.sinhala_type,
      tamilLabel: row.tamil_type,
    };
  });
}

export async function saveReaction(reactTypeId, baseUrl = BASE_URL) {
  console.log('📤 Sending react_type:', reactTypeId);

  const response = await fetch(`${baseUrl}/save_reaction.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `react_type=${reactTypeId}`,
  });

  const text = await response.text();
  console.log('📥 Response:', text);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`Invalid JSON: ${text.substring(0, 100)}`); }

  if (json.status !== 'success') throw new Error(json.message || 'Server error');
  return json;
}

export async function getReactions(baseUrl = BASE_URL) {
  const response = await fetch(`${baseUrl}/get_reactions.php`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}