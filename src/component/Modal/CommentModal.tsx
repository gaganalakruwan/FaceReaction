import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { getOptions, submitOptions, Option } from '../../services/optionsService';

export default function CommentModal({
  visible,
  onClose,
  onSubmitWithComment,
  onSubmitWithoutComment,
  departmentName,
}) {
  const token = useSelector((state: any) => state.auth.token);

  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching options...');
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const data = await getOptions();
      console.log('📦 Options data:', data);
      console.log('📦 Options count:', data.length);

      if (data && Array.isArray(data) && data.length > 0) {
        setOptions(data);
        console.log('✅ Options loaded successfully');
      } else {
        setError('No options available');
      }
    } catch (err: any) {
      console.log('❌ Fetch error:', err);
      setError(err?.message || 'Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOptions();
      setSelectedOptions([]);
    }
  }, [visible]);

  const toggleOption = (id: number) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      if (selectedOptions.length > 0) {
        await submitOptions(selectedOptions);
        onSubmitWithComment(selectedOptions);
      } else {
        onSubmitWithoutComment();
      }
      setSelectedOptions([]);
      onClose();
    } catch (err) {
      console.log('❌ Submit error:', err);
      Alert.alert('Error', 'Failed to submit options');
      onSubmitWithComment(selectedOptions);
      setSelectedOptions([]);
      onClose();
    }
  };

  const handleSkip = () => {
    onSubmitWithoutComment();
    setSelectedOptions([]);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
    
      <View 
        className="flex-1 justify-center items-center" // Tailwind
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // Inline
      >
        <View 
          className="w-[90%] max-h-[80%] rounded-2xl p-5" // Tailwind
          style={{ backgroundColor: '#fff' }} // Inline
        >
          {/* HEADER */}
          <View 
            className="flex-row items-center mb-2.5" // Tailwind
            style={{ gap: 5 }} // Inline
          >
            <Icon name="feedback" size={24} color="#4CAF50" />
            <Text className="flex-1 text-lg font-bold ml-2.5">
              Rate Your Experience
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

    

          <Text className="mb-2.5 font-semibold">
            How was your experience?
          </Text>

          {/* OPTIONS */}
          <ScrollView 
            className="max-h-[350px]" // Tailwind
          >
            {loading ? (
              <View className="p-7.5 items-center">
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text className="mt-2.5 text-gray-600">Loading...</Text>
              </View>
            ) : error ? (
              <View className="p-5 items-center">
                <Icon name="error-outline" size={50} color="#f44336" />
                <Text className="mt-2.5 text-red-500 text-center">
                  {error}
                </Text>
                <TouchableOpacity 
                  onPress={fetchOptions}
                  className="mt-3.75 py-2.5 px-7.5 rounded-lg" // Tailwind
                  style={{ backgroundColor: '#4CAF50' }} // Inline
                >
                  <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : options.length === 0 ? (
              <View className="p-7.5 items-center">
                <Icon name="info-outline" size={50} color="#999" />
                <Text className="mt-2.5 text-gray-600">No options available</Text>
              </View>
            ) : (
              options.map((option) => {
                const selected = selectedOptions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleOption(option.id)}
                    className={`p-3.5 rounded-lg border-[1.5px] mb-2.5 flex-row justify-between items-center ${
                      selected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <Text
                      className={`flex-1 text-sm ${
                        selected 
                          ? 'text-green-800 font-semibold' 
                          : 'text-gray-700 font-normal'
                      }`}
                    >
                      {option.name}
                    </Text>
                    {selected && (
                      <Icon name="check-circle" size={22} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

      
          <View 
            className="flex-row mt-3.75" // Tailwind
            style={{ gap: 10 }} // Inline
          >
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 py-3 rounded-lg items-center justify-center" // Tailwind
              style={{ 
                backgroundColor: '#f5f5f5',
                minHeight: 48
              }} // Inline
            >
              <Text className="text-gray-600 font-medium text-base">Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={selectedOptions.length === 0}
              className="flex-1 py-3 rounded-lg items-center justify-center" // Tailwind
              style={{
                backgroundColor: selectedOptions.length === 0 ? '#d0d0d0' : '#4CAF50',
                minHeight: 48,
              }} // Inline
            >
              <Text
                className="font-semibold text-base text-center" // Tailwind
                style={{
                  color: selectedOptions.length === 0 ? '#999' : '#fff',
                }} // Inline
              >
                Submit {selectedOptions.length > 0 && `(${selectedOptions.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}