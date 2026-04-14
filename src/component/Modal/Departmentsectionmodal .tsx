import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  Animated, ScrollView, ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Types
export interface Section {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface Department {
  id: number;
  name: string;
  name_sinhala?: string | null;
  name_tamil?: string | null;
  code?: string | null;
  is_active?: boolean;
  users_count?: number;
  sections: Section[];
  icon?: string;
  color?: string;
}

export interface DeptSelection {
  department: Department;
  section: Section;
}

interface Props {
  visible: boolean;
  departments: Department[];
  loading?: boolean;
  error?: string | null;
  onConfirm: (selection: DeptSelection) => void;
  onRetry?: () => void;
}

// Component
export default function DepartmentSectionModal({
  visible,
  departments,
  loading = false,
  error = null,
  onConfirm,
  onRetry,
}: Props) {
  const { width: SW, height: SH } = useWindowDimensions();
  const REAL_SHEET_WIDTH = Math.min(SW - 32, 480);
  const SHEET_HEIGHT = SH * 0.72;
  const HEADER_H = 90;
  const STEP_H = 56;
  const PANEL_H = SHEET_HEIGHT - HEADER_H - STEP_H - 2;

  const [step, setStep] = useState<'dept' | 'section'>('dept');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Sheet entrance animation
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  // Panel slide (dept - section)
  const stepSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('dept');
      setSelectedDept(null);
      setSelectedSection(null);
      stepSlide.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      ]).start();
    }
  }, [visible]);

  const goToSection = (dept: Department) => {
    setSelectedDept(dept);
    setSelectedSection(null);
    setStep('section');
    Animated.timing(stepSlide, { toValue: -1, duration: 260, useNativeDriver: true }).start();
  };

  const goToDept = () => {
    setStep('dept');
    setSelectedSection(null);
    Animated.timing(stepSlide, { toValue: 0, duration: 260, useNativeDriver: true }).start();
  };

  const handleConfirm = () => {
    if (selectedDept && selectedSection) {
      onConfirm({ department: selectedDept, section: selectedSection });
    }
  };

  const translateX = stepSlide.interpolate({
    inputRange: [-1, 0],
    outputRange: [-REAL_SHEET_WIDTH, 0],
  });

  // Body
  const renderBody = () => {

    if (loading) {
      return (
        <View className="items-center justify-center py-7 px-6" style={{ gap: 10 }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-sm font-semibold text-[#8E8E93]">Loading departments…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center justify-center py-7 px-6" style={{ gap: 10 }}>
          <View
            className="w-13 h-13 rounded-2xl items-center justify-center"
            style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#FF3B3015' }}
          >
            <Icon name="wifi-off" size={28} color="#FF3B30" />
          </View>
          <Text className="text-[15px] font-extrabold text-[#1A1A2E]">Couldn't load departments</Text>
          <Text className="text-[13px] text-[#8E8E93] text-center">{error}</Text>
          {onRetry && (
            <TouchableOpacity
              className="flex-row items-center bg-[#4CAF50] rounded-xl py-[9px] px-[18px] mt-1"
              style={{ gap: 6 }}
              onPress={onRetry}
            >
              <Icon name="refresh" size={15} color="#fff" />
              <Text className="text-[13px] font-bold text-white">Try again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (departments.length === 0) {
      return (
        <View className="items-center justify-center py-7 px-6" style={{ gap: 10 }}>
          <Icon name="business-center" size={40} color="#C7C7CC" />
          <Text className="text-[15px] font-extrabold text-[#1A1A2E]">No departments found</Text>
          <Text className="text-[13px] text-[#8E8E93] text-center">Ask your system administrator to add departments.</Text>
          {onRetry && (
            <TouchableOpacity
              className="flex-row items-center bg-[#4CAF50] rounded-xl py-[9px] px-[18px] mt-1"
              style={{ gap: 6 }}
              onPress={onRetry}
            >
              <Icon name="refresh" size={15} color="#fff" />
              <Text className="text-[13px] font-bold text-white">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Active sections for selected dept - filter inactive if is_active present
    const activeSections = (selectedDept?.sections ?? []).filter(
      s => s.is_active !== false,
    );

    return (
      <>
        {/* Step indicator */}
        <View className="flex-row items-center justify-center px-12 py-[10px]">
          <StepDot active number={1} done={step === 'section'} label="Department" />
          <View
            className="flex-1 h-[2px] mb-5 mx-2"
            style={{ backgroundColor: step === 'section' ? '#4CAF50' : '#E5E5EA' }}
          />
          <StepDot active={step === 'section'} number={2} done={false} label="Section" />
        </View>

        <View style={{ overflow: 'hidden', height: PANEL_H, width: REAL_SHEET_WIDTH }}>
          <Animated.View style={[
            { flexDirection: 'row' },
            { transform: [{ translateX }], height: PANEL_H, width: REAL_SHEET_WIDTH * 2 }
          ]}>

            {/* Panel 1 - Departments */}
            <View style={{ height: '100%', flex: 1, width: REAL_SHEET_WIDTH }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}
                style={{ flex: 1 }}
              >
                {departments.map(dept => (
                  <TouchableOpacity
                    key={dept.id}
                    className="flex-row items-center py-[14px] px-[14px] rounded-2xl mb-2 border-[1.5px]"
                    style={[
                      { gap: 12, backgroundColor: '#F9F9FB', borderColor: 'transparent' },
                      selectedDept?.id === dept.id && { backgroundColor: '#4CAF5010', borderColor: '#4CAF5040' },
                    ]}
                    onPress={() => goToSection(dept)}
                    activeOpacity={0.72}
                  >
                    <View
                      className="items-center justify-center"
                      style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#4CAF5018' }}
                    >
                      <Icon
                        name={dept.icon ?? 'business'}
                        size={20}
                        color={dept.color ?? '#4CAF50'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-[#1A1A2E]" numberOfLines={1}>{dept.name}</Text>
                      {dept.name_sinhala ? (
                        <Text className="text-[11px] text-[#8E8E93] mt-[1px]" numberOfLines={1}>{dept.name_sinhala}</Text>
                      ) : null}
                      <Text className="text-[11px] text-[#C7C7CC] mt-[2px]" numberOfLines={1}>
                        {dept.sections.filter(s => s.is_active !== false).length} sections
                        {dept.users_count != null ? `  ·  ${dept.users_count} employees` : ''}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={22} color="#C7C7CC" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Panel 2 - Sections */}
            <View style={{ height: '100%', flex: 1, width: REAL_SHEET_WIDTH }}>
              {/* Back */}
              <TouchableOpacity
                className="flex-row items-center px-6 pb-3"
                style={{ gap: 6 }}
                onPress={goToDept}
              >
                <Icon name="arrow-back" size={17} color="#4CAF50" />
                <Text className="text-[13px] font-bold text-[#4CAF50]">{selectedDept?.name ?? 'Back'}</Text>
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ width: '100%', paddingHorizontal: 20, paddingBottom: 20 }}
                style={{ flex: 1 }}
              >
                {activeSections.length === 0 ? (
                  <View className="items-center justify-center py-7 px-6" style={{ gap: 10 }}>
                    <Icon name="folder-open" size={32} color="#C7C7CC" />
                    <Text className="text-[13px] text-[#8E8E93] text-center">No sections in this department</Text>
                  </View>
                ) : (
                  activeSections.map(sec => (
                    <TouchableOpacity
                      key={sec.id}
                      className="flex-row items-center py-[14px] px-[14px] rounded-2xl mb-2 border-[1.5px]"
                      style={[
                        { gap: 12, backgroundColor: '#F9F9FB', borderColor: 'transparent' },
                        selectedSection?.id === sec.id && { backgroundColor: '#4CAF5010', borderColor: '#4CAF5040' },
                      ]}
                      onPress={() => setSelectedSection(sec)}
                      activeOpacity={0.72}
                    >
                      <View className="rounded-full bg-[#4CAF50]" style={{ width: 10, height: 10, borderRadius: 5, marginLeft: 6 }} />
                      <Text className="text-sm font-semibold text-[#1A1A2E]" numberOfLines={1}>{sec.name}</Text>
                      {selectedSection?.id === sec.id && (
                        <Icon name="check-circle" size={22} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {/* Confirm */}
              <View className="px-5 pb-[30px]">
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-[18px] py-[15px]"
                  style={[
                    { gap: 8, backgroundColor: '#4CAF50' },
                    !selectedSection && { backgroundColor: '#C7C7CC' },
                  ]}
                  onPress={handleConfirm}
                  disabled={!selectedSection}
                  activeOpacity={0.85}
                >
                  <Icon name="check" size={18} color="#fff" />
                  <Text className="text-[15px] font-extrabold text-white">Start Kiosk</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>
        </View>
      </>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View
        className="flex-1 justify-center items-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.48)' }}
      >
        <Animated.View
          className="bg-white rounded-[28px] w-full overflow-hidden"
          style={[
            {
              maxWidth: 480,
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              height: SHEET_HEIGHT,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 36 },
                android: { elevation: 20 },
              }),
            },
          ]}
        >
          {/* Header */}
          <View className="flex-row items-center px-5 pt-[22px] pb-[14px]" style={{ gap: 14 }}>
            <View
              className="items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#4CAF5015' }}
            >
              <Icon name="location-city" size={22} color="#4CAF50" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-[#1A1A2E]">Select Location</Text>
              <Text className="text-xs text-[#8E8E93] mt-[2px]">Choose your department and section to begin</Text>
            </View>
          </View>
          <View className="h-[1px] bg-[#F0F0F5] mx-5 mb-[6px]" />

          {renderBody()}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Step dot helper
function StepDot({
  active, done, label, number,
}: { active: boolean; done: boolean; label: string; number: number }) {
  return (
    <View className="items-center" style={{ gap: 4 }}>
      <View
        className="w-7 h-7 rounded-full items-center justify-center"
        style={[
          { backgroundColor: '#E5E5EA' },
          active && { backgroundColor: '#4CAF50' },
          done && { backgroundColor: '#34C759' },
        ]}
      >
        {done
          ? <Icon name="check" size={12} color="#fff" />
          : <Text className="text-xs font-bold" style={{ color: active ? '#fff' : '#8E8E93' }}>{number}</Text>
        }
      </View>
      <Text
        className="text-[11px] font-semibold"
        style={{ color: active ? '#4CAF50' : '#8E8E93' }}
      >
        {label}
      </Text>
    </View>
  );
}