import React, { useState } from 'react';
import { View, Text, Modal, useWindowDimensions } from 'react-native';
import EmojiButton from './EmojiButton';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Breakpoint for switching from 1 row to 2 rows
  const isPhone = width < 720;

  const handleReactionPress = async (index: number) => {
    if (isSubmitting) return;
    const reaction = REACTION_LIST[index];
    setSelectedId(reaction.id);
    setIsSubmitting(true);

    try {
      // Pass the IDs to the API call
      await saveReaction(reaction.id, departmentId, sectionId);

      setTimeout(() => setShowThankYou(true), 200);
      setTimeout(() => {
        setShowThankYou(false);
        setSelectedId(null);
        setIsSubmitting(false);
        onReset?.(); 
      }, 1000);
    } catch (error) {
      alert('Failed to save feedback.');
      setIsSubmitting(false);
      setSelectedId(null);
    }
  };

  const renderEmoji = (item: typeof REACTION_LIST[0], index: number) => (
    <EmojiButton
      key={item.id}
      item={item}
      index={index}
      selected={selectedId !== null ? REACTION_LIST.findIndex(r => r.id === selectedId) : null}
      onPress={handleReactionPress}
      disabled={isSubmitting}
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

      <Modal visible={showThankYou} transparent animationType="fade">
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <View className="w-[85%] bg-white rounded-[25px] p-10 items-center elevation-10" style={{ elevation: 10 }}>
            <Text style={{ fontSize: 50, marginBottom: 15 }}>❤️</Text>
            <Text className="text-[22px] font-extrabold text-center">
              ස්තූතියි! | நன்றி! | Thank You!
            </Text>
            <Text className="text-base text-[#8E8E93] mt-[10px] text-center">
              Your feedback helps us improve.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}