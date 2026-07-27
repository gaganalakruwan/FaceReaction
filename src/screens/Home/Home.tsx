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
import companyLogo from '../../assets/image.png';

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
    // navigation.replace('Login');
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
        
          <View className="flex-row items-center" style={{ gap: 10, maxWidth: '30%' }}>
            <View
              className="items-center justify-center overflow-hidden"
              style={{
                width: 50,
                height: 50,
                borderRadius: 20,
                backgroundColor: '#F0F0F5',
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <Image
                source={companyLogo}
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: 20,
                }}
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-[15px] font-bold text-[#1A1A2E] shrink"
              numberOfLines={1}
            >
              {company?.name ??'' }
            </Text>
          </View>

          <View className="flex-1" />

          {/* Location Chip */}
          <TouchableOpacity
            className="flex-row items-center rounded-[20px] px-3 py-[6px] border"
            style={{ gap: 6, backgroundColor: '#4CAF5010', borderColor: '#4CAF5020' }}
            onPress={handleChangeDept}
          >
            <Icon name="location-city" size={16} color="#4CAF50" />
            <Text className="text-xs font-bold text-[#1A1A2E]" numberOfLines={1}>
              {selection.department.name} › {selection.section.name}
            </Text>
            <Icon name="edit" size={14} color="#8E8E93" />
          </TouchableOpacity>

          <View className="flex-1" />

          {/* User Badge */}
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Icon name="account-circle" size={18} color="#8E8E93" />
            <Text className="text-sm text-[#8E8E93] font-semibold">
              {user?.username ?? 'Admin'}
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="items-center justify-center ml-2"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FF3B3010',
            }}
            onPress={handleLogout}
          >
            <Icon name="logout" size={18} color="#FF3B30" />
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
              : (
                <View
                  className="items-center justify-center overflow-hidden"
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    backgroundColor: '#F0F0F5',
                    borderWidth: 2,
                    borderColor: '#E5E5EA',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={companyLogo}
                    style={{ 
                      width: 150, 
                      height: 150, 
                      borderRadius: 75,
                    }}
                    resizeMode="contain"
                  />
                </View>
              )
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