import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Modal,
  Platform,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {
  X,
  Bookmark,
  BookOpen,
  Globe,
  CheckCircle,
  Download,
  Loader,
  ExternalLink,
} from 'lucide-react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '../context/WishlistContext';
import { useReading } from '../context/ReadingContext';
import { useDownloads } from '../context/DownloadsContext';
import { useNotification } from '../context/NotificationContext';
import { fetchDescription, getCoverUrl, getDownloadFormats } from '../api/openLibrary';
import { findGutenbergBook, GutenbergBook, GUTENDEX_API } from '../api/gutenberg';
import { Book, DownloadFormat, DownloadedBook } from '../types';
import * as FileSystem from 'expo-file-system/legacy';
import { isTablet, isDesktop } from '../utils';

const DRAWER_WIDTH = 480;

interface BookBottomSheetProps {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
  onReadNow?: () => void;
}

export const BookBottomSheet: React.FC<BookBottomSheetProps> = ({
  book,
  visible,
  onClose,
  onReadNow,
}) => {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [description, setDesciption] = useState<string | null>(null)
  const [downloadFormats, setDownloadFormats] = useState<DownloadFormat[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [localVisible, setLocalVisible] = useState(false);
  const closingRef = useRef(false);
  const translateX = useSharedValue(DRAWER_WIDTH);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVisibleRef = useRef(false);
  const backdropOpacity = useSharedValue(0);

  const [localMatch, setLocalMatch] = useState<GutenbergBook | null>(null);
  const [gutendexSummary, setGutendexSummary] = useState<string | null>(null);
  const [gutendexSubjects, setGutendexSubjects] = useState<string[] | null>(null);
  const currentBookKeyRef = useRef<string | null>(null);
  const gutenbergMatch = localMatch || book?.gutenbergMatch;

  const isPublicDomain = !!gutenbergMatch;

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToReading, isInReading } = useReading();
  const { downloadedBooks, addDownload, isDownloaded } = useDownloads();
  const { showNotification } = useNotification();
  const thisBookDownloaded = book ? isDownloaded(book.key) : false;

  const inWishlist = book ? isInWishlist(book.key) : false;
  const inReading = book ? isInReading(book.key) : false;
  const tablet = isTablet(width);
  const desktop = isDesktop(width);

  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const surfaceColor = isDark ? '#1C1B1F' : '#FFFBFE';
  const scrimColor = 'rgba(0, 0, 0, 0.4)';


  useEffect(() => {
    if (visible && book) {
      const thisKey = book.key;
      currentBookKeyRef.current = thisKey;

      // Clear stale data from previous book
      setDesciption(null);
      setGutendexSummary(null);
      setGutendexSubjects(null);
      setDownloadFormats([]);
      setLoadingFormats(true);

      if (book.key && !book.gutenbergMatch?.summary) {
        fetchDescription(book.key).then(data => {
          if (currentBookKeyRef.current === thisKey) setDesciption(data);
        }).catch(() => {
          if (currentBookKeyRef.current === thisKey) setDesciption(null);
        });
      }
      if (book.gutenbergMatch?.id && !book.gutenbergMatch?.summary) {
        const gId = book.gutenbergMatch.id;
        fetch(`${GUTENDEX_API}/${gId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (currentBookKeyRef.current !== thisKey) return;
            if (data?.summaries?.[0]) {
              setGutendexSummary(data.summaries[0]);
            }
            if (data?.subjects?.length) {
              setGutendexSubjects(data.subjects.slice(0, 10));
            }
          })
          .catch(() => {
            if (currentBookKeyRef.current === thisKey) setGutendexSummary(null);
          });
      }
      getDownloadFormats(book).then(fmts => {
        if (currentBookKeyRef.current !== thisKey) return;
        setDownloadFormats(fmts);
        setLoadingFormats(false);
      });
    } else {
      currentBookKeyRef.current = null;
      setDesciption(null);
      setGutendexSummary(null);
      setGutendexSubjects(null);
      setDownloadFormats([]);
    }
  }, [visible, book?.key]);

  const isLargeScreen = desktop || tablet;

  // BottomSheet visibility — fire present()/dismiss() on visible transitions
  useEffect(() => {
    if (isLargeScreen) return;

    const justOpened = visible && !prevVisibleRef.current;
    const justClosed = !visible && prevVisibleRef.current;

    if (justOpened) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(() => {
          dismissTimerRef.current = null;
          bottomSheetRef.current?.present();
        }, 400);
      } else {
        bottomSheetRef.current?.present();
      }
    } else if (justClosed) {
      bottomSheetRef.current?.dismiss();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        dismissTimerRef.current = null;
      }, 500);
    }

    prevVisibleRef.current = visible;
  }, [visible, isLargeScreen, book?.key]);
  useEffect(() => {
    if (isLargeScreen && visible) {
      if (closingRef.current) return;
      setLocalVisible(true);
      translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (isLargeScreen && !visible) {
      closingRef.current = true;
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 250, easing: Easing.in(Easing.cubic) }, () => {
        runOnJS(setLocalVisible)(false);
        runOnJS(() => { closingRef.current = false; })();
      });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, isLargeScreen]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const renderHandle = useCallback(
    () => (
      <View className="items-center pt-3 pb-1">
        <View className="w-32 h-1 bg-md-outline-variant-light dark:bg-md-outline-variant-dark rounded-full" />
      </View>
    ),
    []
  );

  const handleWishlistToggle = useCallback(async () => {
    if (!book) return;
    if (inWishlist) {
      await removeFromWishlist(book.key);
      showNotification({ type: 'info', title: 'Removed', message: 'Book removed from wishlist' });
    } else {
      await addToWishlist(book);
      showNotification({ type: 'success', title: 'Saved to Wishlist', message: book.title });
    }
  }, [book, inWishlist, addToWishlist, removeFromWishlist, showNotification]);

  const handleAddToReading = useCallback(() => {
    if (!book || !gutenbergMatch) return;
    addToReading(book, gutenbergMatch.epubUrl);
    showNotification({ type: 'success', title: 'Added to Reading', message: book.title });
  }, [book, gutenbergMatch, addToReading, showNotification]);

  const handleReadNow = useCallback(() => {
    onClose();
    onReadNow?.();
  }, [onClose, onReadNow]);

  const downloadWithFetch = async (url: string, destPath: string): Promise<void> => {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) Books/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    await FileSystem.writeAsStringAsync(destPath, text, { encoding: FileSystem.EncodingType.UTF8 });
  };

  const downloadWithRNFS = async (url: string, destPath: string): Promise<void> => {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await FileSystem.downloadAsync(url, destPath);
        if (result.status === 200) return;
        if (attempt === maxRetries) {
          throw new Error(`Server returned status ${result.status}`);
        }
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        if (attempt < maxRetries) {
          await new Promise<void>(resolve => setTimeout(resolve, 1000));
        } else {
          throw e;
        }
      }
    }
  };

  const handleDownload = useCallback(async (fmt: DownloadFormat) => {
    setDownloadingFormat(fmt.format);
    try {
      const bookTitle = book?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'book';
      const ext = fmt.format === 'EPUB' ? '.epub' :
        fmt.format === 'HTML' ? '.html' : '.txt';
      const fileName = `${bookTitle}_${fmt.format}${ext}`;

      const destPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory!, { intermediates: true });

      if (fmt.format === 'TXT' || fmt.format === 'HTML') {
        await downloadWithFetch(fmt.url, destPath);
      } else {
        await downloadWithRNFS(fmt.url, destPath);
      }

      const downloadRecord: DownloadedBook = {
        id: book?.key || '',
        title: book?.title || '',
        author_name: book?.author_name,
        cover_i: book?.cover_i,
        coverUrl: book?.coverUrl || book?.gutenbergMatch?.coverUrl || (book?.cover_i ? getCoverUrl(book.cover_i, 'M') : undefined),
        format: fmt.format,
        filePath: destPath,
        gutenbergId: book?.gutenbergMatch?.id,
        downloadedAt: Date.now(),
      };
      await addDownload(downloadRecord);

      showNotification({ type: 'success', title: 'Download Complete', message: `"${fmt.format}" saved.` });
    } catch (err: any) {
      showNotification({ type: 'error', title: 'Download Error', message: err?.message || 'Failed to download file' });
    } finally {
      setDownloadingFormat(null);
    }
  }, [book, showNotification]);

  const snapPoints = useMemo(() => ['80%'], []);

  if (!book) return null;

  const coverUrl = book.cover_i ? getCoverUrl(book.cover_i, 'L') : book.coverUrl;
  const isBorrowable = !!(book.public_scan_b || book.has_fulltext || book.ebook_access === 'borrowable');
  const openLibraryUrl = `https://openlibrary.org${book.key}`;

  const BookContent = () => (
    <>
      {/* Header - Cover and basic info */}
      <View className="flex-row px-6 pt-4 pb-6">
        {/* Cover */}
        <View className="h-[160px] w-[110px] rounded-[12px] overflow-hidden bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark shadow-elevation-2">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <BookOpen size={40} color="#9CA3AF" />
            </View>
          )}
          {isPublicDomain && !thisBookDownloaded && (
            <View className="absolute top-2 left-2 w-7 h-7 rounded-full bg-md-tertiary-light dark:bg-md-tertiary-dark items-center justify-center">
              <Globe size={16} color="#FFFFFF" />
            </View>
          )}
          {thisBookDownloaded && (
            <View className="absolute top-2 left-2 px-2 py-1 rounded-full bg-accent-green items-center justify-center flex-row">
              <CheckCircle size={12} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold ml-1">Saved</Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
            style={{
              backgroundColor: inWishlist
                ? 'rgba(179, 38, 30, 0.9)'
                : 'rgba(255, 255, 255, 0.95)',
            }}
            activeOpacity={0.8}
            onPress={handleWishlistToggle}
          >
            <Bookmark
              size={16}
              color={inWishlist ? '#FFFFFF' : '#49454F'}
              fill={inWishlist ? '#FFFFFF' : 'none'}
            />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="flex-1 ml-4 justify-center">
          <Text
            className="text-md-title-large text-md-onSurface-light dark:text-md-onSurface-dark font-semibold"
            numberOfLines={3}
          >
            {book.title}
          </Text>

          <Text
            className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1"
            numberOfLines={2}
          >
            {book.author_name?.join(', ') || 'Unknown Author'}
          </Text>

          {gutenbergMatch?.firstPublishYear ? (
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              <View className="bg-md-tertiaryContainer-light dark:bg-md-tertiaryContainer-dark px-3 py-1 rounded-full">
                <Text className="text-md-label-medium text-md-onTertiaryContainer-light dark:text-md-onTertiaryContainer-dark">
                  {gutenbergMatch.firstPublishYear}
                </Text>
              </View>
              <View className="bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark px-3 py-1 rounded-full">
                <Text className="text-md-label-medium text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark">
                  Public Domain
                </Text>
              </View>
              {!isPublicDomain && isBorrowable && (
                <View className="bg-md-primaryContainer-light dark:bg-md-primaryContainer-dark px-3 py-1 rounded-full">
                  <Text className="text-md-label-medium text-md-onPrimaryContainer-light dark:text-md-onPrimaryContainer-dark">
                    Borrowable
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              {book.first_publish_year ? (
                <View className="bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark px-3 py-1 rounded-full">
                  <Text className="text-md-label-medium text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark">
                    {book.first_publish_year}
                  </Text>
                </View>
              ) : null}
              {!isPublicDomain && isBorrowable && (
                <View className="bg-md-primaryContainer-light dark:bg-md-primaryContainer-dark px-3 py-1 rounded-full">
                  <Text className="text-md-label-medium text-md-onPrimaryContainer-light dark:text-md-onPrimaryContainer-dark">
                    Borrowable
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View className="px-6 pb-6">
        {openLibraryUrl && !isPublicDomain && (
          <TouchableOpacity
            onPress={() => Linking.openURL(openLibraryUrl)}
            className="flex-row items-center mb-4 bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark px-4 py-3 rounded-[12px]"
          >
            <ExternalLink size={18} color="#49454F" />
            <Text className="text-md-label-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark ml-2 flex-1">
              View on OpenLibrary
            </Text>
            <Text className="text-md-label-small text-md-outline-light dark:text-md-outline-dark" numberOfLines={1}>
              openlibrary.org
            </Text>
          </TouchableOpacity>
        )}

        {loadingMatch && (
          <View className="py-4 items-center">
            <View className="w-6 h-6 border-2 border-md-primary-light border-t-transparent rounded-full animate-spin" />
            <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-2">
              Checking availability...
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3">
          {isPublicDomain && !inReading && (
            <TouchableOpacity
              onPress={handleAddToReading}
              className="bg-md-primary-light dark:bg-md-primary-dark py-4 rounded-[20px] flex-row items-center justify-center"
            >
              <BookOpen size={20} color="#FFFFFF" />
              <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark font-semibold ml-2">
                Add to Reading List
              </Text>
            </TouchableOpacity>
          )}

          {isPublicDomain && inReading && (
            <TouchableOpacity
              onPress={handleReadNow}
              className="bg-md-primary-container-light dark:bg-md-primary-container-dark py-4 rounded-[20px] flex-row items-center justify-center"
            >
              <CheckCircle size={20} color="#21005D" />
              <Text className="text-md-label-large text-md-onPrimaryContainer-light dark:text-md-onPrimaryContainer-dark font-semibold ml-2">
                Continue Reading
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Download Section */}
        {Platform.OS !== 'web' && (Platform.OS === 'android' ? (loadingFormats || downloadFormats.some(f => f.format === 'HTML')) : downloadFormats.length > 0 || loadingFormats) && (
          <View className="mt-6">
            <View className="flex-row items-center mb-3">
              <Download size={18} color="#49454F" />
              <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold ml-2">
                Download
              </Text>
            </View>

            {loadingFormats ? (
              <View className="py-3 items-center flex-row">
                <Loader size={16} color="#9CA3AF" />
                <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark ml-2">
                  Checking formats...
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {downloadFormats.filter(f => Platform.OS !== 'android' || f.format === 'HTML').map((fmt) => {
                  const isDownloading = downloadingFormat === fmt.format;
                  return (
                    <TouchableOpacity
                      key={fmt.format}
                      onPress={() => handleDownload(fmt)}
                      disabled={isDownloading}
                      className={`flex-row items-center px-4 py-3 rounded-[12px] ${isDownloading
                        ? 'bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark'
                        : 'bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark'
                        }`}
                    >
                      {isDownloading ? (
                        <Loader size={16} color="#49454F" />
                      ) : (
                        <Download size={16} color="#49454F" />
                      )}
                      <Text className="text-md-label-medium text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark ml-2">
                        {Platform.OS === 'android' ? 'Download' : fmt.format}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Subjects from original book data */}
        {book.subject && book.subject.length > 0 && (
          <View className="mt-6">
            <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold mb-3">
              Subjects
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {book.subject.slice(0, 8).map((subject, index) => (
                <View
                  key={index}
                  className="bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark px-3 py-2 rounded-full"
                >
                  <Text className="text-md-label-medium text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark">
                    {subject}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(gutenbergMatch?.summary || gutendexSummary || description) && (
          <View className="mt-6">
            <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold mb-3">
              About this Book
            </Text>
            <View className="bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark p-4 rounded-[16px]">
              <Text className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark leading-6">
                {gutenbergMatch?.summary || gutendexSummary || description}
              </Text>
            </View>
          </View>
        )}

        {(() => {
          const subjects = gutenbergMatch?.subjects?.length
            ? gutenbergMatch.subjects
            : (gutendexSubjects?.length ? gutendexSubjects : book.subject) ?? [];
          if (subjects.length === 0) return null;
          return (
            <View className="mt-6">
              <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold mb-3">
                Categories
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {subjects.slice(0, 10).map((subject, index) => (
                  <View
                    key={index}
                    className="bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark px-3 py-2 rounded-full"
                  >
                    <Text className="text-md-label-medium text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark">
                      {subject}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        <View className="h-8" />
      </View>
    </>
  );

  // ---- Desktop & Tablet: Right-side Drawer (Reanimated, UI-thread animation) ----
  if (desktop || tablet) {
    return (
      <Modal
        visible={localVisible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View className="flex-1 flex-row">
          {/* Backdrop */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          >
            <Animated.View
              style={[
                { flex: 1, backgroundColor: scrimColor },
                backdropAnimatedStyle,
              ]}
            />
          </TouchableOpacity>

          {/* Drawer Panel */}
          <Animated.View
            style={[
              {
                width: DRAWER_WIDTH,
                height: '100%',
                backgroundColor: surfaceColor,
                shadowColor: '#000',
                shadowOffset: { width: -4, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 16,
              },
              drawerAnimatedStyle,
            ]}
          >
            {/* Drawer Header */}
            <View
              className="flex-row items-center justify-between px-6 pb-3"
              style={{
                paddingTop: insets.top + 16,
                backgroundColor: surfaceColor,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#2E2A30' : '#E7E0EC',
              }}
            >
              <Text className="text-md-title-large text-md-onSurface-light dark:text-md-onSurface-dark font-semibold">
                Book Details
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full items-center justify-center bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark"
              >
                <X size={20} color={isDark ? '#E6E1E5' : '#1C1B1F'} />
              </TouchableOpacity>
            </View>

            {/* Drawer Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            >
              <BookContent />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // ---- Mobile: Bottom Sheet ----
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleComponent={renderHandle}
      backgroundStyle={{
        backgroundColor: surfaceColor,
      }}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        nestedScrollEnabled={true}
      >
        <BookContent />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
