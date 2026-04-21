import React, { useState } from 'react';
import {
  View, Text, ScrollView,
  KeyboardAvoidingView, Platform, StatusBar,
  StyleSheet,
  Image,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { login } from '../../services/authService';
import { setAuth } from '../../services/store/authSlice';
import { AppDispatch } from '../../services/store/store';
import { ApiError } from '../../services/apiService';
import InputField from '../../component/ui/InputField';
import Button from '../../component/ui/Button';
import Card from '../../component/ui/Card';

interface LoginScreenProps { navigation: any }

export default function LoginScreen({ navigation }: LoginScreenProps) {

  const dispatch = useDispatch<AppDispatch>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await login({ username, password });
      const { token, user, company } = response.data;
      dispatch(setAuth({ token, user, company }));
      navigation.replace('Home');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Network error. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" translucent />

      <ScrollView
        className="flex-1 bg-[#F2F2F7]"
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo block */}
        <View className="items-center mb-7">
          <View
            className="w-20 h-20 rounded-[22px] bg-[#4CAF50] items-center justify-center mb-3"
            style={{
              shadowColor: '#4CAF50',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Icon name="feedback" size={40} color="white" />
          </View>
          <Text className="text-[22px] font-black text-[#1A1A2E] mb-1">
            Feedback Kiosk
          </Text>
          <Text className="text-[13px] text-[#8E8E93]">
            Sign in to your reactive feedback system
          </Text>
        </View>

        {/* Form card */}
        <Card style={{ marginBottom: 20 }} padding={24} radius={24}>
          <Text className="text-[20px] font-black text-[#1A1A2E] mb-1">
            Welcome back
          </Text>
          <Text className="text-[13px] text-[#8E8E93] mb-5">
            Enter your company credentials
          </Text>

          {error ? (
            <View className="bg-[#FF3B3012] rounded-xl p-3 mb-4 border border-[#FF3B3030]">
              <Text className="text-[13px] text-[#FF3B30] font-semibold">
                <Icon name="error" size={14} color="#FF3B30" />{'  '}{error}
              </Text>
            </View>
          ) : null}

          <InputField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Your company username"
            autoCapitalize="none"
            autoCorrect={false}
            icon={<Icon name="person" size={20} color="gray" />}
            returnKeyType="next"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry={!showPass}
            icon={<Icon name="lock" size={20} color="gray" />}
            rightLabel={
              <Icon
                name={showPass ? 'visibility' : 'visibility-off'}
                size={20}
                color="gray"
              />
            }
            onRightPress={() => setShowPass(v => !v)}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            label="Log In"
            onPress={handleLogin}
            loading={loading}
            size="md"
            style={{ marginTop: 8, borderRadius: 16 }}
          />
        </Card>

        {/* Copyright */}
        <View className='flex-row items-center justify-center mb-8 mt-20'>
          <Text className="text-[12px] font-medium text-[#8E8E93]">
            Powered By
          </Text>
          <Image
            source={require('../../assets/footer_image.jpeg')}
            style={{ width: 80, height: 24, resizeMode: 'contain', marginLeft: -4 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// styles
const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: '#F2F2F7',
    padding: 24,
    justifyContent: 'center',
    paddingTop: 100,
  },
});