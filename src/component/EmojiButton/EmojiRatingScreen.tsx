import React, { useState } from 'react';
import { View, Text, Modal, useWindowDimensions } from 'react-native';
import EmojiButton from './EmojiButton';
import CommentModal from '../Modal/CommentModal';
import { REACTION_LIST, saveReaction } from '../../services/reactionService';
import { SafeAreaView } from 'react-native-safe-area-context';

const titleEn = 'How do you rate our service?';
const titleSi = 'ඔබ අපගේ සේවාව තක්සේරු කරන්නේ කෙසේද?';
const titleTa = 'எங்கள் சேவையை நீங்கள் எப்படி மதிப்பிடுகிறீர்கள்?';

interface Props {
  department: string;
  section: string;
  departmentId: number;
  sectionId: number;
  onReset?: () => void;
}

export default function EmojiRatingScreen({
  department,
  section,
  departmentId,
  sectionId,
  onReset,
}: Props) {
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingReaction, setPendingReaction] = useState<number | null>(null);

  const isPhone = width < 720;

  const handleEmojiClick = (index: number) => {
    const reaction = REACTION_LIST[index];
    setSelectedId(reaction.id);
    setPendingReaction(reaction.id);
    setShowCommentModal(true);
  };

  // UPDATED: receives array of selected options
  const handleSubmitWithComment = async (selectedOptions: string[]) => {
    setShowCommentModal(false);
    
    try {
      // Convert selected options to a readable string
      const feedbackText = selectedOptions.join(', ');
      await saveReaction(pendingReaction!, departmentId, sectionId, feedbackText);
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        setSelectedId(null);
        setPendingReaction(null);
        onReset?.();
      }, 1500);
    } catch (error) {
      alert('Failed to save');
      setShowCommentModal(false);
    }
  };

  // User submitted WITHOUT selecting any option
  const handleSubmitWithoutComment = async () => {
    setShowCommentModal(false);
    
    try {
      await saveReaction(pendingReaction!, departmentId, sectionId);
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        setSelectedId(null);
        setPendingReaction(null);
        onReset?.();
      }, 1500);
    } catch (error) {
      alert('Failed to save');
      setShowCommentModal(false);
    }
  };

  const renderEmoji = (item: typeof REACTION_LIST[0], index: number) => (
    <EmojiButton
      key={item.id}
      item={item}
      index={index}
      selected={selectedId !== null ? REACTION_LIST.findIndex(r => r.id === selectedId) : null}
      onPress={handleEmojiClick}
      disabled={false}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA] justify-center">
      <View className="items-center mb-[60px]">
        <Text className="text-xl font-bold text-[#1C1C1E] mt-[15px] text-center">{titleSi}</Text>
        <Text className="text-lg font-bold text-[#1C1C1E] mt-2 text-center">{titleTa}</Text>
        <Text className="text-xl font-semibold text-[#3A3A3C] mt-2 text-center">{titleEn}</Text>
      </View>

      <View className="px-[10px]">
        {isPhone ? (
          <>
            <View className="flex-row justify-center items-start">
              {REACTION_LIST.slice(0, 3).map((item, i) => renderEmoji(item, i))}
            </View>
            <View className="flex-row justify-center items-start mt-5">
              {REACTION_LIST.slice(3, 5).map((item, i) => renderEmoji(item, i + 3))}
            </View>
          </>
        ) : (
          <View className="flex-row justify-center items-start">
            {REACTION_LIST.map((item, i) => renderEmoji(item, i))}
          </View>
        )}
      </View>

      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSubmitWithComment={handleSubmitWithComment}
        onSubmitWithoutComment={handleSubmitWithoutComment}
        departmentName={department}
      />

      <Modal visible={showThankYou} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 25, padding: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 50, marginBottom: 15 }}>❤️</Text>
            <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
              ස්තූතියි! | நன்றி! | Thank You!
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }}>
              Your feedback helps us improve.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}