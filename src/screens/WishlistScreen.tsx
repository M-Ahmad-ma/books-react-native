import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Trash2, BookOpen, Bookmark } from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { Book, GutenbergBook, WishlistItem } from '../types';
import { getCoverUrl } from '../api/openLibrary';
import { BookCard } from '../components/BookCard';
import { BookBottomSheet } from '../components/BookBottomSheet';
import { ThemeToggleButton } from '../navigation/AppNavigator';
import { isMobile, isTablet, isDesktop } from '../utils';
import { AppHeader, EmptyState } from '@/components';

export const WishlistScreen: React.FC = () => {
  const { wishlist, removeFromWishlist, isInWishlist } = useWishlist();

  console.log(wishlist, "[17 in wishlist] wishlist")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const { width } = useWindowDimensions();
  const mobile = isMobile(width);
  const tablet = isTablet(width);
  const desktop = isDesktop(width);

  const handleBookPress = useCallback((item: WishlistItem) => {
    let gutenbergMatch: GutenbergBook | null = null;
    if (item.gutenbergId) {
      gutenbergMatch = {
        id: item.gutenbergId,
        title: item.title,
        author: item.author_name?.join(', ') || '',
        coverUrl: item.coverUrl || '',
        epubUrl: `https://www.gutenberg.org/ebooks/${item.gutenbergId}.epub`,
        summary: item.summary,
        subjects: item.subjects,
        firstPublishYear: item.gutenbergPublishYear,
      };
    }

    const book: Book = {
      key: item.key,
      title: item.title,
      author_name: item.author_name,
      cover_i: item.cover_i,
      coverUrl: item.coverUrl,
      first_publish_year: item.first_publish_year,
      public_scan_b: item.public_scan_b ?? false,
      gutenbergMatch,
    };
    setSelectedBook(book);
    setBottomSheetVisible(true);
  }, []);

  const handleRemove = useCallback((key: string) => {
    removeFromWishlist(key);
  }, [removeFromWishlist]);

  const createBookFromItem = useCallback((item: WishlistItem): Book => {
    let gutenbergMatch: GutenbergBook | null = null;
    if (item.gutenbergId) {
      gutenbergMatch = {
        id: item.gutenbergId,
        title: item.title,
        author: item.author_name?.join(', ') || '',
        coverUrl: item.coverUrl || '',
        epubUrl: `https://www.gutenberg.org/ebooks/${item.gutenbergId}.epub`,
        summary: item.summary,
        subjects: item.subjects,
        firstPublishYear: item.gutenbergPublishYear,
      };
    }
    return {
      key: item.key,
      title: item.title,
      author_name: item.author_name,
      cover_i: item.cover_i,
      coverUrl: item.coverUrl,
      first_publish_year: item.first_publish_year,
      public_scan_b: item.public_scan_b ?? false,
      gutenbergMatch,
    } as Book;
  }, []);

  const handleCardPress = useCallback((book: Book) => {
    setSelectedBook(book);
    setBottomSheetVisible(true);
  }, []);

  const handleFavoritePress = useCallback((book: Book) => {
    removeFromWishlist(book.key);
  }, [removeFromWishlist]);

  console.log(selectedBook, "selectedBook [91 in wishlist]")

  if (desktop || tablet) {
    return (
      <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
        <AppHeader
          title="Wishlist"
          subtitle={`${wishlist.length} ${wishlist.length === 1 ? 'book' : 'books'} saved`}
          rightElement={<ThemeToggleButton />}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 20 }}
        >
          {wishlist.length === 0 ? (
            <EmptyState icon={<Bookmark color="gray" size={40} />} title="Wishlist" description='your wishlist is empty. Tap the  icon on a book to save it here.' />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: 14
              }}
            >
              {wishlist.map((item, index) => (
                <View
                  key={item.key}
                  style={{
                    width: desktop ? '23%' : '32%',
                    marginBottom: 16,
                  }}
                >
                  <BookCard
                    book={createBookFromItem(item)}
                    onPress={() => handleCardPress(createBookFromItem(item))}
                    isFavorite={true}
                    onFavoritePress={() => handleFavoritePress(createBookFromItem(item))}
                  />
                </View>
              ))}
            </View>
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

  // ---- Mobile view ----
  const renderItem = ({ item }: { item: WishlistItem }) => {
    const coverUrl = item.cover_i
      ? getCoverUrl(item.cover_i, 'M')
      : item.coverUrl || null;

    return (
      <TouchableOpacity
        onPress={() => handleBookPress(item)}
        activeOpacity={0.8}
        className="flex-row items-center p-4 mx-5 my-2 rounded-[16px] bg-md-bg-light dark:bg-md-surface-dark"
        style={{
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        }}
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

        <View className="flex-1 ml-4">
          <Text
            className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-medium"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text
            className="text-md-body-medium text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1"
            numberOfLines={1}
          >
            {item.author_name?.join(', ') || 'Unknown Author'}
          </Text>

          <View className="flex-row items-center mt-2">
            <View className="bg-md-secondaryContainer-light dark:bg-md-secondaryContainer-dark px-2 py-1 rounded-[4px]">
              <Text className="text-md-label-small text-md-onSecondaryContainer-light dark:text-md-onSecondaryContainer-dark">
                {new Date(item.addedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => removeFromWishlist(item.key)}
          className="w-10 h-10 absolute top-3 right-2 rounded-full items-center justify-center bg-md-errorContainer-light dark:bg-md-errorContainer-dark"
        >
          <Trash2 size={18} className='dark:text-md-errorContainer-light' />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <AppHeader
        title="Wishlist"
        subtitle={`${wishlist.length} ${wishlist.length === 1 ? 'book' : 'books'} saved`}
        rightElement={<ThemeToggleButton />}
      />

      <FlatList
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <EmptyState icon={<Bookmark color="gray" size={40} />} title="Wishlist" description='your wishlist is empty. Tap the  icon on a book to save it here.' />
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
