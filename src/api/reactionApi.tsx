const BASE_URL = 'http://192.168.1.123/face_api';
 
const EMOJI_MAP = {
  'Terrible': { emoji: '😡', color: '#FF3B30', bg: '#FFF0EF' },
  'Bad':      { emoji: '😞', color: '#FF9500', bg: '#FFF6EC' },
  'Okay':     { emoji: '😐', color: '#FFCC00', bg: '#FFFBEC' },
  'Good':     { emoji: '🙂', color: '#34C759', bg: '#EDFFF2' },
  'Amazing':  { emoji: '😍', color: '#007AFF', bg: '#EBF4FF' },
};

export async function getReactTypes(baseUrl = BASE_URL) {
  const response = await fetch(`${baseUrl}/get_react_types.php`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.message || 'Failed to load emojis');

  return json.data.map((row) => {
    const mapped = EMOJI_MAP[row.type] ?? { emoji: '😶', color: '#8E8E93', bg: '#F5F5F5' };
    return {
      id:    row.id,
      label: row.type,
      emoji: mapped.emoji,
      color: mapped.color,
      bg:    mapped.bg,
    };
  });
}

/**
 * POST save_reaction.php
 */
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

/**
 * GET all reaction logs
 */
export async function getReactions(baseUrl = BASE_URL) {
  const response = await fetch(`${baseUrl}/get_reactions.php`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}