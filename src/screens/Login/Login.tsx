import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
  StatusBar,
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
      // POST /api/auth/login
      // Response: { success, message, data: { token, user, company } }
      const response = await login({ username, password });

      // ✅ company lives at response.data.company — NOT inside user
      const { token, user, company } = response.data;

      // Persist token + user + company to Redux (AsyncStorage via redux-persist)
      dispatch(setAuth({ token, user, company }));

      // Navigation.tsx watches token — swaps to MainStack automatically.
      // replace() is a fallback in case the navigator hasn't re-rendered yet.
      navigation.replace('Home');

    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Network error. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" translucent />

      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <Icon name="feedback" size={40} color="white" />
          </View>
          <Text style={styles.appName}>Feedback Kiosk</Text>
          <Text style={styles.tagline}>Sign in to your reactive feedback system</Text>
        </View>

        {/* Form card */}
        <Card style={styles.formCard} padding={24} radius={24}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSub}>Enter your company credentials</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerTxt}>
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
            style={styles.loginBtn}
          />
        </Card>
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
    justifyContent: 'center'
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 4
  },
  tagline: {
    fontSize: 13,
    color: '#8E8E93'
  },
  formCard: {
    marginBottom: 20
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 4
  },
  formSub: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 20
  },
  errorBanner: {
    backgroundColor: '#FF3B3012',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B3030'
  },
  errorBannerTxt: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600'
  },
  loginBtn: {
    marginTop: 8,
    borderRadius: 16
  },
});