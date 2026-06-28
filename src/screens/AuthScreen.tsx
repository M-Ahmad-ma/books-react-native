import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { BookOpen, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useAuth } from '../context/AuthContext';
import { isDesktop, isTablet } from '@/utils';

type Mode = 'login' | 'register';

function BrandPanel({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(compact ? 0 : 30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const bgColor = isDark ? '#2D1B69' : '#EADDFF';

  return (
    <Animated.View
      className={`${compact ? 'items-center mb-6' : 'items-center justify-center flex-1 px-12'}`}
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: !compact ? bgColor : undefined }}
    >
      <View className={`${compact ? 'w-16 h-16 rounded-2xl' : 'w-24 h-24 rounded-3xl'} bg-md-primary-light dark:bg-md-primary-dark items-center justify-center mb-5 shadow-lg`}>
        <BookOpen size={compact ? 28 : 44} color="#FFFFFF" strokeWidth={1.5} />
      </View>
      <Text className={`${compact ? 'text-3xl' : 'text-5xl'} font-bold tracking-tight text-md-onSurface-light dark:text-md-onSurface-dark`}>
        Bibliothèque
      </Text>
      <Text className={`${compact ? 'text-md-body-large mt-2' : 'text-xl mt-4 max-w-sm text-center leading-7'} text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark`}>
        A quiet corner for the books you love and the ones still waiting.
      </Text>
    </Animated.View>
  );
}

function AnimatedField({ index, children }: { index: number; children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 200 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

export function AuthScreen() {
  const { login, register } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = isDesktop(width);
  const tablet = isTablet(width);
  const wide = desktop || tablet;

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password, name: name.trim() });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  }

  const primaryColor = isDark ? '#D0BCFF' : '#6750A4';
  const inputBg = isDark ? '#36343B' : '#F3EDF7';
  const labelColor = isDark ? '#CAC4D0' : '#49454F';

  const formCard = (
    <View className={`${wide ? 'w-full max-w-md' : 'w-full px-6'}`}>
      <View className={`${wide ? 'bg-md-surface-light dark:bg-md-surface-dark rounded-3xl shadow-2xl p-8' : ''}`}>
        {error && (
          <AnimatedField index={0}>
            <View className="bg-md-errorContainer-light dark:bg-md-errorContainer-dark rounded-xl px-4 py-3 mb-5">
              <Text className="text-md-body-medium text-md-onErrorContainer-light dark:text-md-onErrorContainer-dark text-center">
                {error}
              </Text>
            </View>
          </AnimatedField>
        )}

        <View className="gap-4">
          {mode === 'register' && (
            <AnimatedField index={1}>
              <View>
                <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">Name</Text>
                <View className="flex-row items-center rounded-xl px-4" style={{ backgroundColor: inputBg }}>
                  <User size={20} color={labelColor} />
                  <TextInput
                    className="flex-1 py-3.5 pl-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
                    placeholder="Your name"
                    placeholderTextColor={labelColor}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </AnimatedField>
          )}

          <AnimatedField index={mode === 'register' ? 2 : 1}>
            <View>
              <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">Email</Text>
              <View className="flex-row items-center rounded-xl px-4" style={{ backgroundColor: inputBg }}>
                <Mail size={20} color={labelColor} />
                <TextInput
                  className="flex-1 py-3.5 pl-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
                  placeholder="you@example.com"
                  placeholderTextColor={labelColor}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>
          </AnimatedField>

          <AnimatedField index={mode === 'register' ? 3 : 2}>
            <View>
              <Text className="text-md-label-large text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">Password</Text>
              <View className="flex-row items-center rounded-xl px-4" style={{ backgroundColor: inputBg }}>
                <Lock size={20} color={labelColor} />
                <TextInput
                  className="flex-1 py-3.5 pl-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                  placeholderTextColor={labelColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={mode === 'register' ? 'new-password' : 'password'}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={labelColor} /> : <Eye size={20} color={labelColor} />}
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedField>

          <AnimatedField index={mode === 'register' ? 4 : 3}>
            <TouchableOpacity
              className="py-4 rounded-xl items-center justify-center mt-2 flex-row gap-2"
              style={{ backgroundColor: primaryColor }}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-md-label-large font-semibold text-md-onPrimary-light dark:text-md-onPrimary-dark">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
                </>
              )}
            </TouchableOpacity>
          </AnimatedField>
        </View>

        <AnimatedField index={mode === 'register' ? 5 : 4}>
          <View className="flex-row justify-center mt-8">
            <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text className="text-md-body-medium font-semibold text-md-primary-light dark:text-md-primary-dark">
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedField>
      </View>
    </View>
  );

  if (desktop) {
    return (
      <View className="flex-1 flex-row bg-md-background-light dark:bg-md-background-dark">
        <View className="w-[40%] items-center justify-center" style={{ backgroundColor: isDark ? '#2D1B69' : '#EADDFF' }}>
          <BrandPanel isDark={isDark} compact={false} />
        </View>
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow items-center justify-center py-12"
          keyboardShouldPersistTaps="handled"
        >
          {formCard}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-md-background-light dark:bg-md-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="py-8"
          style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
        >
          <BrandPanel isDark={isDark} compact />
          {formCard}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
