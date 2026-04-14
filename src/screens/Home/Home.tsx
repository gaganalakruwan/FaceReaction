import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  Platform, ActivityIndicator,
  StatusBar, Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCompanyDepartments, Department, Section } from '../../services/departmentService';
import { clearAuth, setSelection } from '../../services/store/authSlice';
import { RootState, AppDispatch } from '../../services/store/store';
import { ApiError } from '../../services/apiService';
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
  const { user, company, selection: savedSelection } = useSelector((s: RootState) => s.auth);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [kioskActive, setKioskActive] = useState(!!savedSelection);

  const loadDepartments = useCallback(async () => {
    setDeptLoading(true);
    setDeptError(null);
    try {
      const data = await getCompanyDepartments();
      setDepartments(data);

      // Show modal only if no saved selection
      if (!savedSelection) setModalVisible(true);

    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        dispatch(clearAuth());
        navigation.replace('Login');
      } else {
        setDeptError('Could not load departments.');
        // Still show modal so user can retry
        if (!savedSelection) setModalVisible(true);
      }
    } finally {
      setDeptLoading(false);
    }
  }, [savedSelection, dispatch]);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const handleModalConfirm = (sel: DeptSelection) => {
    // Now stores full objects - .name and .id both work
    dispatch(setSelection({
      department: { id: sel.department.id, name: sel.department.name },
      section: { id: sel.section.id, name: sel.section.name },
    }));
    setModalVisible(false);
    setKioskActive(true);
  };

  const handleChangeDept = () => {
    setKioskActive(false);
    setModalVisible(true);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    navigation.replace('Login');
  };

  const selection = savedSelection as DeptSelection | null;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {kioskActive && selection && (
        <View
          className="flex-row items-center px-[14px] pb-[10px] bg-white border-b border-[#F0F0F5] z-10"
          style={{
            paddingTop: Platform.OS === 'ios' ? 54 : 14,
            elevation: 2,
          }}
        >
          {/* Company Logo + Name */}
          <View className="flex-row items-center" style={{ gap: 8, maxWidth: '30%' }}>
            <Image
              source={companyLogo}
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
            <Text
              className="text-[13px] font-bold text-[#1A1A2E] shrink"
              numberOfLines={1}
            >
              {company?.name ?? 'Company'}
            </Text>
          </View>

          <View className="flex-1" />

          {/* Location Chip */}
          <TouchableOpacity
            className="flex-row items-center rounded-[20px] px-3 py-[6px] border"
            style={{ gap: 6, backgroundColor: '#4CAF5010', borderColor: '#4CAF5020' }}
            onPress={handleChangeDept}
          >
            <Icon name="location-city" size={14} color="#4CAF50" />
            <Text className="text-xs font-bold text-[#1A1A2E]" numberOfLines={1}>
              {selection.department.name} › {selection.section.name}
            </Text>
            <Icon name="edit" size={13} color="#8E8E93" />
          </TouchableOpacity>

          <View className="flex-1" />

          {/* User Badge */}
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Icon name="account-circle" size={16} color="#8E8E93" />
            <Text className="text-xs text-[#8E8E93] font-semibold">
              {user?.username ?? 'Admin'}
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="items-center justify-center ml-2"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: '#FF3B3010',
            }}
            onPress={handleLogout}
          >
            <Icon name="logout" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* Kiosk area */}
      <View className="flex-1" pointerEvents={kioskActive ? 'auto' : 'none'}>
        {kioskActive && selection ? (
          <EmojiRatingScreen
            key={`${selection.department.id}-${selection.section.id}`}
            departmentId={selection.department.id}
            sectionId={selection.section.id}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            {deptLoading
              ? <ActivityIndicator size="large" color="#4CAF50" />
              : <Image
                  source={companyLogo}
                  style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
                />
            }
            {!deptLoading && (
              <Text className="text-[#8E8E93] text-base font-medium mt-[15px]">
                Select Location to Begin
              </Text>
            )}
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