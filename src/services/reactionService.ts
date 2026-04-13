import { SAVE_REACTION } from '../constants/api';
import { Post } from '../services/apiService';

// Types
export interface ReactionType {
  id: number;
  type: string;
  emoji: string;
  sinhala: string;
  tamil: string;
  color: string;
  bg: string;
}

export interface SaveReactionPayload {
  reaction_id: number;
  department_id: number | null;
  section_id: number | null;
}

export interface SaveReactionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    react_type_id: number;
    department_id: number | null;
    section_id: number | null;
    created_at: string;
  };
}

// Static Data
export const EMOJI_MAP: Record<number, ReactionType> = {
  1: { id: 1, type: 'Excellent', emoji: '😍', sinhala: 'විශිෂ්ටයි', tamil: 'மிகச்சிறந்த', color: '#007AFF', bg: '#EBF4FF' },
  2: { id: 2, type: 'Good', emoji: '🙂', sinhala: 'හොඳයි', tamil: 'சிறந்த', color: '#34C759', bg: '#EDFFF2' },
  3: { id: 3, type: 'Average', emoji: '😐', sinhala: 'සාමාන්‍යය', tamil: 'சராசரி', color: '#FFCC00', bg: '#FFFBEC' },
  4: { id: 4, type: 'Poor', emoji: '🙁', sinhala: 'දුර්වලයි', tamil: 'மோசமான', color: '#FF9500', bg: '#FFF6EC' },
  5: { id: 5, type: 'Very Poor', emoji: '☹️', sinhala: 'ඉතා දුර්වලයි', tamil: 'மிகவும் மோசமான', color: '#FF3B30', bg: '#FFF0EF' },
};

export const REACTION_LIST = Object.values(EMOJI_MAP);

// API Calls
// POST /api/reactions
export const saveReaction = (
  reactionId: number,
  departmentId: number | null,
  sectionId: number | null,
) =>
  Post<SaveReactionResponse>(SAVE_REACTION, {
    reaction_id: reactionId,
    department_id: departmentId,
    section_id: sectionId,
  });