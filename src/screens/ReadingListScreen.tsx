import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, ChevronRight, Library, Download, CheckCircle, Trash2 } from 'lucide-react-native';
import { AppHeader, EmptyState, BookCard, SkeletonGrid } from '../components';
import { useReading } from '../context/ReadingContext';
import { useDownloads } from '../context/DownloadsContext';
import { useNotification } from '../context/NotificationContext';
import { ReadingBook, Book, DownloadedBook } from '../types';
import { getCoverUrl } from '../api/openLibrary';
import { BookBottomSheet } from '../components/BookBottomSheet';
import { ThemeToggleButton } from '../navigation/AppNavigator';
import { isDesktop, isTablet } from '../utils';

export const ReadingListScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { readingBooks, removeFromReading, isLoading } = useReading();
  const { showNotification } = useNotification();
  const { downloadedBooks } = useDownloads();
  const [selectedBook, _setSelectedBook] = useState<Book | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const desktop = isDesktop(width);
  const tablet = isTablet(width);

  const handleBookPress = (book: ReadingBook) => {
    router.push({ pathname: '/reader/[id]', params: { id: book.id } });
  };

  const handleDownloadedBookPress = (item: DownloadedBook) => {
    console.log('[ReadingList] Tapped downloaded book:', { id: item.id, filePath: item.filePath, format: item.format });
    if (item.format === 'TXT' || item.format === 'HTML') {
      router.push({
        pathname: '/reader/[id]',
        params: { id: item.id, localFile: item.filePath, format: item.format },
      });
    } else {
      showNotification({ type: 'info', title: 'Open File', message: `Opening in external reader...` });
    }
  };

  const handleRemoveBook = async (book: ReadingBook) => {
    try {
      console.log('[ReadingList] Removing book:', book.id);
      await removeFromReading(book.id);
      showNotification({ type: 'info', title: 'Removed', message: 'Book removed from reading list' });
    } catch (error) {
      console.error('[ReadingList] Error removing book:', error);
    }
  };

  const renderDownloadedBook = (item: DownloadedBook) => {
    const coverUrl = item.cover_i ? getCoverUrl(item.cover_i, 'M') : item.coverUrl;

    return (
      <TouchableOpacity
        className="flex-row p-4 mx-5 my-2 rounded-[16px] bg-md-surface-light dark:bg-md-surface-dark"
        key={item.id}
        onPress={() => handleDownloadedBookPress(item)}
        activeOpacity={0.8}
      >
        <View className="h-[90px] w-[60px] rounded-[8px] overflow-hidden bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <BookOpen size={24} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View className="flex-1 ml-4 justify-center">
          <Text
            className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-medium"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {item.author_name && (
            <Text
              className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1"
              numberOfLines={1}
            >
              {item.author_name.join(', ')}
            </Text>
          )}

          <View className="flex-row items-center mt-2 gap-2">
            <View className="flex-row items-center bg-accent-green px-2 py-1 rounded-full">
              <CheckCircle size={12} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold ml-1">
                Downloaded
              </Text>
            </View>
            <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark">
              {item.format}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const mapReadingToBook = (item: ReadingBook): Book => ({
    key: item.id,
    title: item.title,
    author_name: item.author_name,
    cover_i: item.cover_i,
    coverUrl: item.coverUrl,
    public_scan_b: true,
    has_fulltext: true,
    ebook_access: 'borrowable',
    gutenbergMatch: item.gutenbergId ? {
      id: Number(item.gutenbergId),
      title: item.title,
      author: item.author_name?.join(', ') || '',
      coverUrl: item.coverUrl || '',
      epubUrl: item.epubUrl,
    } : undefined,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <AppHeader
          title="My Library"
          subtitle="Loading..."
          rightElement={<ThemeToggleButton />}
        />
        <SkeletonGrid />
      </SafeAreaView>
    );
  }

  if (desktop || tablet) {
    const cardWidth = desktop ? '23%' : '32%';
    return (
      <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <AppHeader
          title="My Library"
          subtitle={`${readingBooks.length} ${readingBooks.length === 1 ? 'book' : 'books'} in progress`}
          rightElement={<ThemeToggleButton />}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        >
          {readingBooks.length === 0 && downloadedBooks.length === 0 ? (
            <EmptyState
              icon={<Library size={40} color="#CAC4D0" />}
              title="No books yet"
              description="Add books from Discover to start reading"
            />
          ) : (
            <>
              {readingBooks.length > 0 && (
                <>
                  <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold px-1 mt-4 mb-3">
                    In Progress
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    {readingBooks.map((item) => (
                      <View
                        key={item.id}
                        style={{ width: cardWidth, marginBottom: 16 }}
                      >
                        <View className="relative">
                          <BookCard
                            book={mapReadingToBook(item)}
                            onPress={() => handleBookPress(item)}
                            progress={item.progress}
                          />
                          <TouchableOpacity
                            onPress={() => handleRemoveBook(item)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center z-10"
                            style={{ backgroundColor: '#B3261E' }}
                          >
                            <Trash2 size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {downloadedBooks.length > 0 && (
                <>
                  <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold px-1 mt-6 mb-3">
                    Downloads
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    {downloadedBooks.map((item) => {
                      const coverUrl = item.cover_i ? getCoverUrl(item.cover_i, 'M') : item.coverUrl;
                      return (
                        <View
                          key={item.id}
                          style={{ width: cardWidth, marginBottom: 16 }}
                        >
                          <BookCard
                            book={{
                              key: item.id,
                              title: item.title,
                              author_name: item.author_name,
                              cover_i: item.cover_i,
                              coverUrl,
                              public_scan_b: true,
                              has_fulltext: true,
                              ebook_access: 'borrowable',
                              gutenbergMatch: item.gutenbergId ? {
                                id: item.gutenbergId,
                                title: item.title,
                                author: item.author_name?.join(', ') || '',
                                coverUrl: coverUrl || '',
                                epubUrl: '',
                              } : undefined,
                            }}
                            onPress={() => handleDownloadedBookPress(item)}
                          />
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>

        <BookBottomSheet
          book={selectedBook}
          visible={bottomSheetVisible}
          onClose={() => setBottomSheetVisible(false)}
        />
      </SafeAreaView>
    );
  }

  const renderBook = ({ item }: { item: ReadingBook }) => {
    const coverUrl = item.cover_i
      ? getCoverUrl(item.cover_i, 'M')
      : item.coverUrl || null;

    return (
      <View className="flex-row mx-5 my-2 rounded-[16px] bg-md-bg-light dark:bg-md-surface-dark" style={{
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
      }}>
        <TouchableOpacity
          className="flex-row flex-1 p-4"
          onPress={() => handleBookPress(item)}
          activeOpacity={0.8}
        >
          <View className="h-[90px] w-[60px] rounded-[8px] overflow-hidden bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark">
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <BookOpen size={24} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View className="flex-1 ml-4 justify-center">
            <Text
              className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-medium"
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {item.author_name && (
              <Text
                className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1"
                numberOfLines={1}
              >
                {item.author_name.join(', ')}
              </Text>
            )}

            {item.progress !== undefined && (
              <View className="mt-3">
                <View className="h-1.5 bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark rounded-full overflow-hidden">
                  <View
                    className="h-full bg-md-primary-light dark:bg-md-primary-dark rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </View>

                <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1.5">
                  {item.progress}% complete
                </Text>
              </View>
            )}
          </View>

          <View className="justify-center ml-2">
            <ChevronRight size={20} color="#CAC4D0" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log('[ReadingList] Delete tapped for:', item.id);
            handleRemoveBook(item);
          }}
           className="w-10 h-10 absolute top-2 right-2 rounded-full items-center justify-center bg-md-errorContainer-light dark:bg-md-errorContainer-dark"

          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} className='dark:text-md-errorContainer-light' />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <AppHeader
        title="My Library"
        subtitle={`${readingBooks.length} ${readingBooks.length === 1 ? 'book' : 'books'} in progress`}
        rightElement={<ThemeToggleButton />}
      />

      <FlatList
        data={readingBooks}
        renderItem={renderBook}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={downloadedBooks.length > 0 ? (
          <View className="mb-4">
            <View className="px-5 pt-2 pb-2">
              <View className="flex-row items-center">
                <Download size={20} color="#49454F" />
                <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold ml-2">
                  Downloads
                </Text>
                <Text className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark ml-2">
                  ({downloadedBooks.length})
                </Text>
              </View>
            </View>
            {downloadedBooks.map(renderDownloadedBook)}
          </View>
        ) : undefined}
        ListEmptyComponent={
          <EmptyState
            icon={<Library size={40} color="#CAC4D0" />}
            title="No books yet"
            description="Add books from Discover to start reading"
          />
        }
      />

      <BookBottomSheet
        book={selectedBook}
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
      />
    </SafeAreaView>
  );
};
