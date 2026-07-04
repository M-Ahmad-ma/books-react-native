import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Bookmark,
  Library,
  LogOut,
  Edit3,
  Check,
  X,
  BookCheck,
  Calendar,
  Camera,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useReading } from '../context/ReadingContext';
import { AppHeader } from '../components/AppHeader';
import { ThemeToggleButton } from '../navigation/AppNavigator';
import { isDesktop, isTablet } from '@/utils';
import { pickImage } from '@/utils/pickImage';

function StatCard({
  icon,
  label,
  value,
  color,
  wide,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  wide: boolean;
  small: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: 200, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  // Dynamic width
  let width = '47%';
  if (small) width = '30%';
  if (wide) width = '100%'; // or 'auto' for flex

  return (
    <Animated.View
      className={`
        rounded-2xl 
        bg-md-surface-light dark:bg-md-surface-dark
        border border-md-outline-variant-light dark:border-md-outline-variant-dark
        items-center justify-center
        p-4 py-5
        min-h-[100px]
        shadow-sm
        ${Platform.OS === 'web' ? 'hover:shadow-md transition-shadow' : ''}
      `}
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        { width },
        wide && { flex: 1, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      {/* Optional: accent circle behind icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: color + '20' }} // 20% opacity of the primary color
      >
        {icon}
      </View>

      <Text className="text-[28px] font-bold tracking-tight text-md-onSurface-light dark:text-md-onSurface-dark">
        {value}
      </Text>
      <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
        {label}
      </Text>
    </Animated.View>
  );
}

export function ProfileScreen() {
  const { user, logout, updateUserProfile } = useAuth();
  const { wishlist } = useWishlist();
  const { readingBooks } = useReading();
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const desktop = isDesktop(width);
  const tablet = isTablet(width);
  const wide = desktop || tablet;
  const small = width < 640;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  const finishedBooks = readingBooks.filter(b => (b.progress ?? 0) >= 100);
  const inputBg = isDark ? '#36343B' : '#F3EDF7';

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  async function handlePickImage() {
    const dataUrl = await pickImage();
    if (dataUrl) {
      setAvatarUrl(dataUrl);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setAvatarUrl(user?.avatar_url || '');
    setEditing(false);
  }

  async function handleLogout() {
    logout();
  }

  if (!user) return null;

  const primaryColor = isDark ? '#D0BCFF' : '#6750A4';
  const surfaceColor = isDark ? '#36343B' : '#F3EDF7';
  const labelColor = isDark ? '#CAC4D0' : '#49454F';
  const avatarLetter = user.name.charAt(0).toUpperCase();

  const profileContent = (
    <>
      <View className="items-center pt-8 pb-6 px-6">
        <View className="relative mb-5">
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} className="w-20 h-20 rounded-2xl" style={{ borderWidth: 3, borderColor: isDark ? '#D0BCFF' : '#EADDFF' }} />
          ) : (
            <View className="w-28 h-28 rounded-2xl items-center justify-center" style={{ backgroundColor: primaryColor, borderWidth: 3, borderColor: isDark ? '#D0BCFF' : '#EADDFF' }}>
              <Text className="text-[32px] font-bold text-white">{avatarLetter}</Text>
            </View>
          )}
        </View>
        <Text className="text-[28px] font-bold tracking-tight text-md-onSurface-light dark:text-md-onSurface-dark">
          {user.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1">
          <Mail size={14} color={labelColor} />
          <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
            {user.email}
          </Text>
        </View>
      </View>

      <View className={`gap-3 mb-6 ${!wide ? 'flex  flex-row justify-center' : 'w-full p-3  flex flex-row items-center justify-center'}`}>
        <StatCard
          icon={<Bookmark size={20} color={primaryColor} strokeWidth={1.5} />}
          label="Wishlist"
          value={wishlist.length}
          color={primaryColor}
          wide={wide}
          small={small}
        />
        <StatCard
          icon={<Library size={20} color={primaryColor} strokeWidth={1.5} />}
          label="Reading"
          value={readingBooks.length}
          color={primaryColor}
          wide={wide}
          small={small}
        />
        <StatCard
          icon={<BookCheck size={20} color={primaryColor} strokeWidth={1.5} />}
          label="Finished"
          value={finishedBooks.length}
          color={primaryColor}
          wide={wide}
          small={small}
        />
      </View>

      <View className="mx-4 mb-6 rounded-2xl bg-md-surface-light dark:bg-md-surface-dark border border-md-outline-variant-light dark:border-md-outline-variant-dark px-5 py-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark">
            Profile
          </Text>
          {!editing ? (
            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: surfaceColor }}
              onPress={() => setEditing(true)}
            >
              <Edit3 size={14} color={primaryColor} />
              <Text className="text-md-label-medium text-md-primary-light dark:text-md-primary-dark">
                Edit
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: isDark ? '#8C1D18' : '#F9DEDC' }}
                onPress={handleCancel}
              >
                <X size={16} color={isDark ? '#F2B8B5' : '#B3261E'} />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Check size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {editing ? (
          <>
            <View className="mb-4">
              <Text className="text-md-label-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">
                Avatar
              </Text>
              <TouchableOpacity
                className="flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: inputBg }}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-xl" />
                ) : (
                  <View className="w-10 h-10 rounded-xl items-center justify-center bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark">
                    <User size={18} color={labelColor} />
                  </View>
                )}
                <View className="flex-1 ml-3">
                  <Text className="text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark">
                    {avatarUrl ? 'Change Photo' : 'Add Photo'}
                  </Text>
                  <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-0.5">
                    Pick from your device
                  </Text>
                </View>
                <Camera size={18} color={labelColor} />
              </TouchableOpacity>
            </View>
            <View className="mb-4">
              <Text className="text-md-label-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">
                Name
              </Text>
              <View className="flex-row items-center rounded-xl px-4" style={{ backgroundColor: inputBg }}>
                <User size={18} color={labelColor} />
                <TextInput
                  className="flex-1 py-3 pl-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor={labelColor}
                />
              </View>
            </View>
            <View>
              <Text className="text-md-label-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mb-1.5 ml-1">
                Bio
              </Text>
              <View className="rounded-xl px-4" style={{ backgroundColor: inputBg }}>
                <TextInput
                  className="py-3 text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  placeholder="A few words about yourself..."
                  placeholderTextColor={labelColor}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: surfaceColor }}>
                <User size={16} color={labelColor} />
              </View>
              <View className="flex-1">
                <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
                  Name
                </Text>
                <Text className="text-md-body-large text-md-onSurface-light dark:text-md-onSurface-dark">
                  {user.name}
                </Text>
              </View>
            </View>
            <View className="h-px bg-md-outline-variant-light dark:bg-md-outline-variant-dark mb-3" />
            <View className="flex-row gap-3">
              <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: surfaceColor }}>
                <Calendar size={16} color={labelColor} />
              </View>
              <View className="flex-1">
                <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
                  Bio
                </Text>
                <Text className="text-md-body-medium text-md-onSurface-light dark:text-md-onSurface-dark mt-0.5 leading-5">
                  {user.bio || 'No bio yet'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      <View className="mx-4 mb-8">
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-md-error-light dark:border-md-error-dark"
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <LogOut size={18} color={isDark ? '#F2B8B5' : '#B3261E'} />
          <Text className="text-md-label-large font-medium text-md-error-light dark:text-md-error-dark">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const wrapper = wide ? (
    <View className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <AppHeader title="Profile" rightElement={<ThemeToggleButton />} />
      <ScrollView className="flex-1" contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="max-w-3xl mx-auto w-full">{profileContent}</View>
      </ScrollView>
    </View>
  ) : (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <AppHeader title="Profile" rightElement={<ThemeToggleButton />} />
      <ScrollView className="flex-1" contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        {profileContent}
      </ScrollView>
    </SafeAreaView>
  );

  return wrapper;
}
