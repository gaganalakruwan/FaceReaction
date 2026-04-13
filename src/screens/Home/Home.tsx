import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator,
  StatusBar, Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCompanyDepartments, Department, Section } from '../../api/Departmentapi';
import { clearAuth, setSelection } from '../../api/store/authSlice';
import { RootState, AppDispatch } from '../../api/store/store';
import { ApiError } from '../../api/client';
import EmojiRatingScreen from '../../component/EmojiButton/EmojiRatingScreen';
import DepartmentSectionModal from '../../component/Modal/Departmentsectionmodal ';
import companyLogo from '../../assets/company_logo.jpeg';

interface HomeScreenProps { navigation: any }

export interface DeptSelection {
  department: Department;
  section: Section;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, company, selection: savedSelection } = useSelector((s: RootState) => s.auth); // read from Redux
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [deptLoading, setDeptLoading]   = useState(false);
  const [deptError,   setDeptError]     = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [kioskActive,  setKioskActive]  = useState(!!savedSelection); // start active if selection exists

  const loadDepartments = useCallback(async () => {
    setDeptLoading(true);
    setDeptError(null);
    try {
      const response = await getCompanyDepartments();
      setDepartments(response);
      // Only show modal if no saved selection
      if (!savedSelection) setModalVisible(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        dispatch(clearAuth());
      } else {
        setDeptError('Could not load departments.');
        if (!savedSelection) setModalVisible(true);
      }
    } finally {
      setDeptLoading(false);
    }
  }, [savedSelection, dispatch]);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const handleModalConfirm = (sel: DeptSelection) => {
    dispatch(setSelection({ // Save to Redux (persisted to AsyncStorage automatically)
      department: sel.department,
      section: sel.section,
    }));
    setModalVisible(false);
    setKioskActive(true);
  };

  const handleChangeDept = () => {
    setKioskActive(false);
    setModalVisible(true);
  };

  const handleLogout = () => {
    dispatch(clearAuth()); // clearAuth already wipes selection too
    navigation.replace('Login');
  };

  // Use savedSelection from Redux
  const selection = savedSelection as DeptSelection | null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {kioskActive && selection && (
        <View style={styles.adminBar}>
          <View style={styles.companyLogoContainer}>
            <Image source={companyLogo} style={styles.headerLogo} />
            <Text style={styles.companyName} numberOfLines={1}>{company?.name ?? 'Company'}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.locationChip} onPress={handleChangeDept}>
            <Icon name="location-city" size={14} color="#4CAF50" />
            <Text style={styles.locationChipTxt} numberOfLines={1}>
              {selection.department.name} › {selection.section.name}
            </Text>
            <Icon name="edit" size={13} color="#8E8E93" />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <View style={styles.userBadge}>
            <Icon name="account-circle" size={16} color="#8E8E93" />
            <Text style={styles.userBadgeTxt}>{user?.username ?? 'Admin'}</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="logout" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.kioskWrap} pointerEvents={kioskActive ? 'auto' : 'none'}>
        {kioskActive && selection ? (
          <EmojiRatingScreen
            key={`${selection.department.id}-${selection.section.id}`}
            departmentId={selection.department.id}
            sectionId={selection.section.id}
          />
        ) : (
          <View style={styles.placeholder}>
            {deptLoading
              ? <ActivityIndicator size="large" color="#4CAF50" />
              : <Image source={companyLogo} style={styles.placeholderLogo} />
            }
            {!deptLoading && <Text style={styles.placeholderText}>Select Location to Begin</Text>}
          </View>
        )}
      </View>

      <DepartmentSectionModal
        visible={modalVisible}
        departments={departments}
        loading={deptLoading}
        error={deptError}
        onConfirm={handleModalConfirm}
        onRetry={loadDepartments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  adminBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingTop: Platform.OS === 'ios' ? 54 : 14, 
    paddingBottom: 10, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F5', 
    elevation: 2, 
    zIndex: 10 
  },
  companyLogoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    maxWidth: '30%' 
  },
  headerLogo: { 
    width: 28, 
    height: 28, 
    borderRadius: 14 
  },
  companyName: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#1A1A2E', 
    flexShrink: 1 
  },
  locationChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#4CAF5010', 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    gap: 6, 
    borderWidth: 1, 
    borderColor: '#4CAF5020' 
  },
  locationChipTxt: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#1A1A2E' 
  },
  userBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  userBadgeTxt: { 
    fontSize: 12, 
    color: '#8E8E93', 
    fontWeight: '600' 
  },
  logoutBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: 10, 
    backgroundColor: '#FF3B3010', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 8 
  },
  kioskWrap: { 
    flex: 1 
  },
  placeholder: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  placeholderLogo: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 10 
  },
  placeholderText: { 
    marginTop: 15, 
    color: '#8E8E93', 
    fontSize: 16, 
    fontWeight: '500' 
  }
});