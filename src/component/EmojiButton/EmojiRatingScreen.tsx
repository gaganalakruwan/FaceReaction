import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, useWindowDimensions } from 'react-native';
import EmojiButton from './EmojiButton'; 
import { REACTION_LIST, saveReaction } from '../../services/reactionService';
import { SafeAreaView } from 'react-native-safe-area-context';

const titleEn = 'How do you rate our service?';
const titleSi = 'ඔබ අපගේ සේවාව තක්සේරු කරන්නේ කෙසේද?';
const titleTa = 'எங்கள் சேவையை நீங்கள் எப்படி மதிப்பிடுகிறீர்கள்?';

interface Props {
  department: string;
  section: string; 
  departmentId: number; // Added departmentId
  sectionId: number;    // Added sectionId
  onReset?: () => void;
}

export default function EmojiRatingScreen({ 
  department, 
  section, 
  departmentId, 
  sectionId, 
  onReset 
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
      
      setTimeout(() => setShowThankYou(true), 600);
      setTimeout(() => {
        setShowThankYou(false);
        setSelectedId(null);
        setIsSubmitting(false);
        onReset?.();
      }, 4500);
    } catch (error) {
      alert("Failed to save feedback.");
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Visual feedback of which department/section is active (optional display) */}
        {/* <Text style={styles.deptLabel}>{department}</Text> */}
        {/* <Text style={styles.sectionLabel}>{section}</Text> */}
        
        <Text style={styles.questionSi}>{titleSi}</Text>
        <Text style={styles.questionTa}>{titleTa}</Text>
        <Text style={styles.questionEn}>{titleEn}</Text>
      </View>

      <View style={styles.emojiWrapper}>
        {isPhone ? (
          <>
            <View style={styles.emojiRow}>
              {REACTION_LIST.slice(0, 3).map((item, i) => renderEmoji(item, i))}
            </View>
            <View style={[styles.emojiRow, { marginTop: 20 }]}>
              {REACTION_LIST.slice(3, 5).map((item, i) => renderEmoji(item, i + 3))}
            </View>
          </>
        ) : (
          <View style={styles.emojiRow}>
            {REACTION_LIST.map((item, i) => renderEmoji(item, i))}
          </View>
        )}
      </View>

      <Modal visible={showThankYou} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.thankYouCard}>
             <Text style={styles.thankYouEmoji}>❤️</Text>
             <Text style={styles.thankYouTitle}>ස්තූතියි! | நன்றி! | Thank You!</Text>
             <Text style={styles.thankYouSub}>Your feedback helps us improve.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center' 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 60 
  },
  deptLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#8E8E93', 
    textTransform: 'uppercase' 
  },
  sectionLabel: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1C1C1E' 
  },
  questionSi: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginTop: 15, 
    textAlign: 'center' 
  },
  questionTa: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1C1C1E', 
    marginTop: 8, 
    textAlign: 'center' 
  },
  questionEn: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#3A3A3C', 
    marginTop: 8, 
    textAlign: 'center' 
  },
  emojiWrapper: { 
    paddingHorizontal: 10 
  },
  emojiRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  thankYouCard: { 
    width: '85%', 
    backgroundColor: 'white', 
    borderRadius: 25, 
    padding: 40, 
    alignItems: 'center', 
    elevation: 10 
  },
  thankYouEmoji: { 
    fontSize: 50, 
    marginBottom: 15 
  },
  thankYouTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    textAlign: 'center' 
  },
  thankYouSub: { 
    fontSize: 16, 
    color: '#8E8E93', 
    marginTop: 10 
  },
});