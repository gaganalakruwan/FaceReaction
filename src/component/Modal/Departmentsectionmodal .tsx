import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, ScrollView, ActivityIndicator,
  Platform, Dimensions,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ─── Types ────────────────────────────────────────────────────────────────────
// These match the shapes returned by GET /api/departments (managerApi)

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
  // optional display hints (not from API — caller can omit)
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

// ─── Component ────────────────────────────────────────────────────────────────
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

  // Panel slide (dept ↔ section)
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

  // ── Body ───────────────────────────────────────────────────────────────────
  const renderBody = () => {

    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingTxt}>Loading departments…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.state}>
          <View style={styles.errorIconWrap}>
            <Icon name="wifi-off" size={28} color="#FF3B30" />
          </View>
          <Text style={styles.errorTitle}>Couldn't load departments</Text>
          <Text style={styles.errorSub}>{error}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Icon name="refresh" size={15} color="#fff" />
              <Text style={styles.retryTxt}>Try again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (departments.length === 0) {
      return (
        <View style={styles.state}>
          <Icon name="business-center" size={40} color="#C7C7CC" />
          <Text style={styles.errorTitle}>No departments found</Text>
          <Text style={styles.errorSub}>Ask your system administrator to add departments.</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
              <Icon name="refresh" size={15} color="#fff" />
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Active sections for selected dept — filter inactive if is_active present
    const activeSections = (selectedDept?.sections ?? []).filter(
      s => s.is_active !== false,
    );

    return (
      <>
        {/* ── Step indicator ── */}
        <View style={styles.stepRow}>
          <StepDot active number={1} done={step === 'section'} label="Department" />
          <View style={[styles.stepLine, step === 'section' && styles.stepLineActive]} />
          <StepDot active={step === 'section'} number={2} done={false} label="Section" />
        </View>

        {/* ── Sliding panels ──
            FIX: panels container has explicit height instead of flex:1
            so the ScrollView inside gets a real measured parent.          */}
        <View style={[styles.panelClip, { height: PANEL_H, width: REAL_SHEET_WIDTH }]}>
          <Animated.View style={[
            styles.panelRow, 
            { transform: [{ translateX }], height: PANEL_H, width: REAL_SHEET_WIDTH * 2 }
          ]}>

            {/* Panel 1 — Departments */}
            <View style={[styles.panel, { width: REAL_SHEET_WIDTH }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                style={{ flex: 1 }}
              >
                {departments.map(dept => (
                  <TouchableOpacity
                    key={dept.id}
                    style={[
                      styles.listItem,
                      selectedDept?.id === dept.id && styles.listItemActive,
                    ]}
                    onPress={() => goToSection(dept)}
                    activeOpacity={0.72}
                  >
                    <View style={styles.itemIcon}>
                      <Icon
                        name={dept.icon ?? 'business'}
                        size={20}
                        color={dept.color ?? '#4CAF50'}
                      />
                    </View>
                    <View style={styles.itemTextBlock}>
                      <Text style={styles.itemName} numberOfLines={1}>{dept.name}</Text>
                      {dept.name_sinhala ? (
                        <Text style={styles.itemSub} numberOfLines={1}>{dept.name_sinhala}</Text>
                      ) : null}
                      <Text style={styles.itemMeta} numberOfLines={1}>
                        {dept.sections.filter(s => s.is_active !== false).length} sections
                        {dept.users_count != null ? `  ·  ${dept.users_count} employees` : ''}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={22} color="#C7C7CC" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Panel 2 — Sections */}
            <View style={[styles.panel, { width: REAL_SHEET_WIDTH }]}>
              {/* Back */}
              <TouchableOpacity style={styles.backRow} onPress={goToDept}>
                <Icon name="arrow-back" size={17} color="#4CAF50" />
                <Text style={styles.backTxt}>{selectedDept?.name ?? 'Back'}</Text>
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                style={{ flex: 1 }}
              >
                {activeSections.length === 0 ? (
                  <View style={styles.state}>
                    <Icon name="folder-open" size={32} color="#C7C7CC" />
                    <Text style={styles.errorSub}>No sections in this department</Text>
                  </View>
                ) : (
                  activeSections.map(sec => (
                    <TouchableOpacity
                      key={sec.id}
                      style={[
                        styles.listItem,
                        selectedSection?.id === sec.id && styles.listItemActive,
                      ]}
                      onPress={() => setSelectedSection(sec)}
                      activeOpacity={0.72}
                    >
                      <View style={styles.sectionDot} />
                      <Text style={styles.itemName} numberOfLines={1}>{sec.name}</Text>
                      {selectedSection?.id === sec.id && (
                        <Icon name="check-circle" size={22} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {/* Confirm */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.confirmBtn, !selectedSection && styles.confirmBtnOff]}
                  onPress={handleConfirm}
                  disabled={!selectedSection}
                  activeOpacity={0.85}
                >
                  <Icon name="check" size={18} color="#fff" />
                  <Text style={styles.confirmTxt}>Start Kiosk</Text>
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
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              height: SHEET_HEIGHT,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon name="location-city" size={22} color="#4CAF50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Select Location</Text>
              <Text style={styles.headerSub}>Choose your department and section to begin</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {renderBody()}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Step dot helper ──────────────────────────────────────────────────────────
function StepDot({
  active, done, label, number,
}: { active: boolean; done: boolean; label: string; number: number }) {
  return (
    <View style={styles.dotWrap}>
      <View style={[styles.dot, active && styles.dotActive, done && styles.dotDone]}>
        {done
          ? <Icon name="check" size={12} color="#fff" />
          : <Text style={[styles.dotNum, active && { color: '#fff' }]}>{number}</Text>
        }
      </View>
      <Text style={[styles.dotLabel, active && styles.dotLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  // KEY FIX: explicit height so inner flex children get real space
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.18, shadowRadius: 36 },
      android: { elevation: 20 },
    }),
  },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14, gap: 14 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#4CAF5015', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F5', marginHorizontal: 20, marginBottom: 6 },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 10, gap: 0 },
  dotWrap: { alignItems: 'center', gap: 4 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: '#4CAF50' },
  dotDone: { backgroundColor: '#34C759' },
  dotNum: { fontSize: 12, fontWeight: '700', color: '#8E8E93' },
  dotLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  dotLabelActive: { color: '#4CAF50' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E5EA', marginBottom: 20, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: '#4CAF50' },

  // Panels — explicit height so ScrollView renders
  panelClip: { overflow: 'hidden' },
  panelRow: { flexDirection: 'row' },
  panel: { height: '100%', flex: 1 },
  listContent: { 
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
   },

  // List items
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 14, 
    borderRadius: 16, 
    marginBottom: 8, 
    backgroundColor: '#F9F9FB', 
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12 
  },
  listItemActive: { backgroundColor: '#4CAF5010', borderColor: '#4CAF5040' },
  itemIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#4CAF5018', alignItems: 'center', justifyContent: 'center' },
  itemTextBlock: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  itemSub: { fontSize: 11, color: '#8E8E93', marginTop: 1 },
  itemMeta: { fontSize: 11, color: '#C7C7CC', marginTop: 2 },
  sectionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50', marginLeft: 6 },

  // Back row
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingBottom: 12 },
  backTxt: { fontSize: 13, fontWeight: '700', color: '#4CAF50' },

  footer: { 
    paddingHorizontal: 20, 
    paddingBottom: 30,
  },
  // Confirm button
  confirmBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#4CAF50', 
    borderRadius: 18, 
    paddingVertical: 15, 
    gap: 8 
  },
  confirmBtnOff: { backgroundColor: '#C7C7CC' },
  confirmTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Empty / loading / error states
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, paddingHorizontal: 24, gap: 10 },
  loadingTxt: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  errorIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#FF3B3015', alignItems: 'center', justifyContent: 'center' },
  errorTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  errorSub: { fontSize: 13, color: '#8E8E93', textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 9, paddingHorizontal: 18, gap: 6, marginTop: 4 },
  retryTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});