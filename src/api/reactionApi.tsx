/**
 * api/reactionApi.tsx
 * Fixed POST — uses URLEncoded body instead of FormData
 * (FormData sometimes fails silently in React Native)
 */

const BASE_URL = 'http://192.168.1.123/face_api'; // ← your server IP

/**
 * POST save_reaction.php
 */
export async function saveReaction(reactTypeId, baseUrl = BASE_URL) {
  console.log('📤 Sending react_type:', reactTypeId);
  console.log('📡 URL:', `${baseUrl}/save_reaction.php`);

  const response = await fetch(`${baseUrl}/save_reaction.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // ← fixes FormData issue
    },
    body: `react_type=${reactTypeId}`,  // ← plain string, no FormData needed
  });

  console.log('📥 HTTP status:', response.status);
  const text = await response.text();
  console.log('📥 Raw response:', text);

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON: ${text.substring(0, 100)}`);
  }

  if (json.status !== 'success') throw new Error(json.message || 'Server error');
  return json;
}

/**
 * GET get_reactions.php
 */
export async function getReactions(baseUrl = BASE_URL) {
  const response = await fetch(`${baseUrl}/get_reactions.php`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}