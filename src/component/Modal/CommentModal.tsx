import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitWithComment: (selectedOptions: string[]) => void;
  onSubmitWithoutComment: () => void;
  departmentName: string;
}

// Predefined options
const ratingOptions = [
  { id: 'good', label: 'Good', emoji: '👍', color: '#4CAF50' },
  { id: 'bad', label: 'Bad', emoji: '👎', color: '#FF9800' },
  { id: 'awful', label: 'Awful', emoji: '😫', color: '#F44336' },
  { id: 'not_satisfied', label: 'Not Satisfied', emoji: '😞', color: '#9E9E9E' },
];

export default function CommentModal({
  visible,
  onClose,
  onSubmitWithComment,
  onSubmitWithoutComment,
  departmentName,
}: CommentModalProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      onSubmitWithComment(selectedOptions);
    } else {
      onSubmitWithoutComment();
    }
    setSelectedOptions([]);
  };

  const handleSkip = () => {
    onSubmitWithoutComment();
    setSelectedOptions([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="feedback" size={24} color="#4CAF50" />
            <Text style={styles.title}>Rate Your Experience</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={22} color="#999" />
            </TouchableOpacity>
          </View>

          

          {/* Rating Options with Checkboxes */}
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <View style={styles.optionsContainer}>
            {ratingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionItem,
                  selectedOptions.includes(option.id) && {
                    borderColor: option.color,
                    backgroundColor: `${option.color}10`,
                  },
                ]}
                onPress={() => toggleOption(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checkboxRow}>
                  <View style={[
                    styles.checkbox,
                    selectedOptions.includes(option.id) && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}>
                    {selectedOptions.includes(option.id) && (
                      <Icon name="check" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.optionLabel,
                    selectedOptions.includes(option.id) && {
                      color: option.color,
                      fontWeight: 'bold',
                    },
                  ]}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected count */}
          {selectedOptions.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                Selected: {selectedOptions.length} option(s)
              </Text>
            </View>
          )}

          {/* Two Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Icon name="skip-next" size={18} color="#666" />
              <Text style={styles.skipText}>Skip & Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                selectedOptions.length === 0 && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={selectedOptions.length === 0}
            >
              <Icon name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>
                Submit {selectedOptions.length > 0 ? `(${selectedOptions.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  closeBtn: {
    padding: 5,
  },
  deptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  deptText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    backgroundColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  optionLabel: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  selectedCount: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedCountText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  skipButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#C8E6C9',
    opacity: 0.7,
  },
  skipText: {
    color: '#666',
    fontWeight: '600',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});