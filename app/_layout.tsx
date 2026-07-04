import { useState } from 'react';
import { View, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthScreen } from '../src/screens/AuthScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { ConnectivityProvider, useConnectivity } from '../src/context/ConnectivityContext';
import { NoInternetScreen } from '../src/components/NoInternetScreen';
import { WishlistProvider } from '../src/context/WishlistContext';
import { ReadingProvider } from '../src/context/ReadingContext';
import { DownloadsProvider } from '../src/context/DownloadsContext';
import { ReaderPreferencesProvider } from '../src/context/ReaderPreferencesContext';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { SplashScreen } from '../src/components/SplashScreen';
import { SplashProvider } from '../src/context/SplashContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const initDatabaseTables = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wishlist (
      key TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      first_publish_year INTEGER,
      addedAt INTEGER
    )
  `);

  try { await db.execAsync('ALTER TABLE wishlist ADD COLUMN public_scan_b INTEGER DEFAULT 0'); } catch { }
  try { await db.execAsync('ALTER TABLE wishlist ADD COLUMN gutenbergId INTEGER'); } catch { }
  try { await db.execAsync('ALTER TABLE wishlist ADD COLUMN summary TEXT'); } catch { }
  try { await db.execAsync('ALTER TABLE wishlist ADD COLUMN subjects TEXT'); } catch { }
  try { await db.execAsync('ALTER TABLE wishlist ADD COLUMN gutenbergPublishYear INTEGER'); } catch { }
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reading_books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      epubUrl TEXT NOT NULL,
      htmlUrl TEXT,
      gutenbergId TEXT,
      addedAt INTEGER,
      progress REAL DEFAULT 0,
      lastReadAt INTEGER
    )
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS downloaded_books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      format TEXT NOT NULL,
      filePath TEXT NOT NULL,
      gutenbergId INTEGER,
      downloadedAt INTEGER
    )
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reader_preferences (
      id INTEGER PRIMARY KEY DEFAULT 1,
      theme TEXT DEFAULT 'light',
      font TEXT DEFAULT 'georgia',
      fontSize REAL DEFAULT 18,
      lineHeight REAL DEFAULT 1.8
    )
  `);
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reader_preferences'
  );
  if (row?.count === 0) {
    await db.runAsync(
      `INSERT INTO reader_preferences (id, theme, font, fontSize, lineHeight) VALUES (1, ?, ?, ?, ?)`,
      ['light', 'georgia', 18, 1.8]
    );
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS auth_session (
      id INTEGER PRIMARY KEY DEFAULT 1,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      user_json TEXT NOT NULL
    )
  `);
};

function AppContent() {
  const [splashDone, setSplashDone] = useState(Platform.OS === 'web');
  const { isConnected } = useConnectivity();
  const { isAuthenticated, isLoading } = useAuth();

  if (!splashDone) {
    return (
      <View className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <StatusBar style="auto" />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </View>
    );
  }

  if (isLoading) {
    return <View className="flex-1 bg-md-background-light dark:bg-md-background-dark" />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <View className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="reader/[id]"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
      <StatusBar style="auto" />
      {!isConnected && (
        <View className="absolute inset-0 z-50">
          <NoInternetScreen />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }} className="bg-md-background-light dark:bg-md-background-dark">
        <SafeAreaProvider>
          <NotificationProvider>
            <BottomSheetModalProvider>
              <QueryClientProvider client={queryClient}>
                <SQLiteProvider databaseName="books.db" onInit={initDatabaseTables}>
                  <ConnectivityProvider>
                    <WishlistProvider>
                      <ReadingProvider>
                        <DownloadsProvider>
                          <ReaderPreferencesProvider>
                            <SplashProvider>
                              <AuthProvider>
                                <AppContent />
                              </AuthProvider>
                            </SplashProvider>
                          </ReaderPreferencesProvider>
                        </DownloadsProvider>
                      </ReadingProvider>
                    </WishlistProvider>
                  </ConnectivityProvider>
                </SQLiteProvider>
              </QueryClientProvider>
            </BottomSheetModalProvider>
          </NotificationProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
