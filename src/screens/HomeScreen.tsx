import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { SkeletonGrid } from '../components/Skeleton';
import { BookBottomSheet } from '../components/BookBottomSheet';
import {
  searchBooks,
  getTrendingBooks,
  filterPublicDomainBooks,
} from '../api/openLibrary';
import { getGutenbergPublicDomainBooks, searchGutenbergBooks, GutenbergBook } from '../api/gutenberg';
import { Book } from '../types';
import { ThemeToggleButton } from '../navigation/AppNavigator';
import { useWishlist } from '../context/WishlistContext';
import { AppHeader, EmptyState, FeaturedSection, ReadingProgressCard, SectionHeader, HeroSection } from '../components';
import { isDesktop, isMobile, isTablet } from '@/utils';

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'drama', label: 'Drama' },
  { id: 'humor', label: 'Humor' },
  { id: 'science_fiction', label: 'Sci-Fi' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'romance', label: 'Romance' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'historical_fiction', label: 'Historical' },
  { id: 'horror', label: 'Horror' },
  { id: 'poetry', label: 'Poetry' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'science', label: 'Science' },
  { id: 'history', label: 'History' },
];

const mapGutenbergToBook = (gb: GutenbergBook): Book =>
  ({
    key: `/works/OL${gb.id}W`,
    title: gb.title,
    author_name: [gb.author],
    coverUrl: gb.coverUrl,
    gutenbergMatch: gb,
    public_scan_b: true,
    has_fulltext: true,
    ebook_access: 'borrowable',
  }) as Book;

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { width } = useWindowDimensions()

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobile = isMobile(width)
  const tablet = isTablet(width)
  const Desktop = isDesktop(width)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);
  const [showPublicDomainOnly, setShowPublicDomainOnly] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const trendingQuery = useInfiniteQuery({
    queryKey: ['trending', premiumFilter],
    queryFn: ({ pageParam = 0 }) =>
      getTrendingBooks(20, pageParam, premiumFilter),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length * 20 : undefined,
    enabled: !showPublicDomainOnly,
    initialPageParam: 0,
  });

  const gutenbergQuery = useInfiniteQuery({
    queryKey: ['gutenberg-public', selectedFilter],
    queryFn: ({ pageParam = 1 }) =>
      getGutenbergPublicDomainBooks(
        20,
        pageParam,
        selectedFilter === 'all' ? undefined : selectedFilter,
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next !== null ? allPages.length + 1 : undefined,
    enabled: showPublicDomainOnly,
    initialPageParam: 1,
  });

  const searchQueryHook = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, selectedFilter, showPublicDomainOnly],
    queryFn: async ({ pageParam = 0 }) => {
      const filter =
        selectedFilter === 'all' ? undefined : selectedFilter;
      if (showPublicDomainOnly) {
        if (Platform.OS === 'web') {
          const data = await searchBooks(debouncedQuery, 20, pageParam, filter);
          return { ...data, docs: filterPublicDomainBooks(data.docs) };
        }
        return searchGutenbergBooks(debouncedQuery, 20, pageParam, filter);
      }
      return searchBooks(debouncedQuery, 20, pageParam, filter);
    },
    getNextPageParam: (lastPage, allPages) => {
      const fetchedSoFar = allPages.length * 20;
      return fetchedSoFar < lastPage.numFound ? fetchedSoFar : undefined;
    },
    enabled: searchMode && debouncedQuery.length > 0,
    initialPageParam: 0,
  });

  const featuredQuery = useQuery({
    queryKey: ['featured'],
    queryFn: () => getTrendingBooks(10, 0),
  });

  const discoverOnlineQuery = useQuery({
    queryKey: ['discover-online'],
    queryFn: () => getTrendingBooks(15, 0),
  });

  const featuredBooks = featuredQuery.data || [];

  const discoverOnlineBooks = useMemo(
    () => discoverOnlineQuery.data?.filter(b => !b.gutenbergMatch) || [],
    [discoverOnlineQuery.data],
  );

  const trendingBooks = useMemo(
    () => trendingQuery.data?.pages.flat() || [],
    [trendingQuery.data],
  );


  const gutenbergBooks = useMemo(
    () => gutenbergQuery.data?.pages.flatMap(p => p.books) || [],
    [gutenbergQuery.data],
  );

  const searchResults = useMemo(() => {
    const all = searchQueryHook.data?.pages.flatMap(p => p.docs) || [];
    return showPublicDomainOnly ? all : filterPublicDomainBooks(all);
  }, [searchQueryHook.data, showPublicDomainOnly]);

  const books = searchMode
    ? searchResults
    : showPublicDomainOnly
      ? gutenbergBooks.map(mapGutenbergToBook)
      : trendingBooks;

  const isLoading = searchMode
    ? searchQueryHook.isLoading
    : showPublicDomainOnly
      ? gutenbergQuery.isLoading
      : trendingQuery.isLoading;

  const isFetchingMore = searchMode
    ? searchQueryHook.isFetchingNextPage
    : showPublicDomainOnly
      ? gutenbergQuery.isFetchingNextPage
      : trendingQuery.isFetchingNextPage;

  const loadMore = () => {
    if (searchMode) {
      searchQueryHook.fetchNextPage();
    } else if (showPublicDomainOnly) {
      gutenbergQuery.fetchNextPage();
    } else {
      trendingQuery.fetchNextPage();
    }
  };

  const handleCardPress = useCallback((book: Book) => {
    setSelectedBook(book);
    setBottomSheetVisible(true);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
  }, []);

  const handleFavoritePress = useCallback(
    (book: Book) => {
      if (isInWishlist(book.key)) {
        removeFromWishlist(book.key);
      } else {
        addToWishlist(book);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist],
  );



  const renderBook = ({ item }: { item: Book; index: number }) => {
    return (
      <BookCard
        book={item}
        onPress={() => handleCardPress(item)}
        isFavorite={isInWishlist(item.key)}
        onFavoritePress={() => handleFavoritePress(item)}
      />
    );
  };


  const searchBarProps = {
    value: searchQuery,
    onChangeText: (text: string) => {
      setSearchQuery(text);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (text.length === 0) {
        setDebouncedQuery('');
        setSearchMode(false);
      } else {
        searchTimeoutRef.current = setTimeout(() => {
          setDebouncedQuery(text);
          setSearchMode(true);
        }, 400);
      }
    },
    onSubmit: () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (searchQuery.length > 0) {
        setDebouncedQuery(searchQuery);
        setSearchMode(true);
      }
    },
    placeholder: 'Search by title or author...',
  };

  const filterChips = (
    <View className="pb-3 mt-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTER_CATEGORIES.map(filter => {
          const active = searchMode
            ? selectedFilter === filter.id
            : (showPublicDomainOnly ? selectedFilter : premiumFilter) === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => {
                if (searchMode) {
                  setSelectedFilter(filter.id);
                } else {
                  showPublicDomainOnly
                    ? setSelectedFilter(filter.id)
                    : setPremiumFilter(filter.id);
                }
              }}
              className={`px-4 py-2 rounded-[20px] ${active
                ? 'bg-md-primary-light dark:bg-md-primary-dark'
                : 'bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark'
                }`}
            >
              <Text
                className={`text-md-label-medium font-display-medium ${active
                  ? 'text-md-onPrimary-light dark:text-md-onPrimary-dark'
                  : 'text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark'
                  }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const sectionHeaderToggle = (
    <View className="px-5 mb-4 mt-2">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl text-md-onSurface-light dark:text-md-onSurface-dark font-semibold">
            {searchMode ? 'Search Results' : showPublicDomainOnly ? 'Free Books' : 'Trending'}
          </Text>

        </View>

        <TouchableOpacity
          onPress={() => {
            setShowPublicDomainOnly(!showPublicDomainOnly);
            setSearchMode(false);
            setSearchQuery('');
          }}
          className={`flex-row items-center px-4 py-2 rounded-full ${showPublicDomainOnly
            ? 'bg-md-primaryContainer-light dark:bg-md-primary-dark'
            : 'bg-md-secondaryContainer-light dark:bg-md-primary-dark'
            }`}
        >
          {showPublicDomainOnly ? (
            <Sparkles size={16} color="#492532" />
          ) : (
            <Globe size={16} color="#31111D" />
          )}

          <Text
            className={`ml-2 text-md-label-medium font-medium ${showPublicDomainOnly
              ? 'text-md-onSecondaryContainer-light dark:text-md-onSurface-light'
              : 'text-md-onTertiaryContainer-light dark:text-md-onSurface-light'
              }`}
          >
            {showPublicDomainOnly ? 'OpenLibrary' : 'Gutendex'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const cardWidth = Desktop ? '23%' : mobile ? '48%' : '32%';

  const bookGrid = (
    <View style={{ paddingHorizontal: 20 }}>
      {isLoading && books.length === 0 ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <EmptyState title="No books found" description="Try adjusting your search or filters" />
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 6,
            }}
          >
            {books.map((item, index) => (
              <View
                key={`${item.key}-${index}`}
                style={{
                  width: cardWidth,
                  marginBottom: 16,
                }}
              >
                {renderBook({ item, index })}
              </View>
            ))}
          </View>

          {isFetchingMore && (
            <View className="py-6 px-5">
              <SkeletonGrid />
            </View>
          )}
        </>
      )}
    </View>
  );

  // ---- Desktop Layout ----
  if (Desktop) {
    return (
      <View className="font-display-medium flex-1 bg-md-background-light dark:bg-md-background-dark">
        <AppHeader
          title="Discover"
          rightElement={
            <View className="flex-row items-center gap-3">
              <SearchBar {...searchBarProps} />
              <ThemeToggleButton />
            </View>
          }
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {!searchMode && (
            <HeroSection
              coverUrl={featuredBooks[0]?.cover_i
                ? `https://covers.openlibrary.org/b/id/${featuredBooks[0].cover_i}-L.jpg`
                : featuredBooks[0]?.coverUrl}
              onPress={featuredBooks[0] ? () => handleCardPress(featuredBooks[0]) : undefined}
            />
          )}
          {filterChips}
          {sectionHeaderToggle}
          {bookGrid}
        </ScrollView>

        <BookBottomSheet
          book={selectedBook}
          visible={bottomSheetVisible}
          onClose={handleCloseBottomSheet}
        />
      </View>
    );
  }

  // ---- Mobile / Tablet Layout ----
  return (
    <SafeAreaView className="flex-1 bg-md-background-light dark:bg-md-background-dark">
      <StatusBar barStyle="default" />

      <AppHeader
        title="Discover"
        rightElement={
          tablet ? (
            <View className="flex-row gap-3">
              <ThemeToggleButton />
              <SearchBar {...searchBarProps} />
            </View>
          ) : (
            <ThemeToggleButton />
          )
        }
      />

      {/* Scrollable Content */}
      <View className="flex-1">
        {/* Search - mobile only */}
        <View className={`${tablet && 'hidden'} px-5 pb-3 mt-3`}>
          <SearchBar {...searchBarProps} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
            const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
            if (distanceFromBottom < 200 && !isFetchingMore) {
              loadMore();
            }
          }}
          scrollEventThrottle={16}
        >
          {/* featured section  */}
          {!searchMode && tablet && (
            <FeaturedSection
              title="Featured Books"
              books={featuredBooks.slice(0, 4)}
              isLoading={featuredQuery.isLoading}
              onBookPress={handleCardPress}
              onFavoritePress={handleFavoritePress}
              isInWishlist={isInWishlist}
            />
          )}

          {/* Continue Reading / Start Reading — mobile only */}
          {!searchMode && mobile && (
            <ReadingProgressCard />
          )}

          {filterChips}

          {/* Discover Online - mobile only */}
          {!searchMode && mobile && discoverOnlineBooks.length > 0 && (
            <View className="mb-2">
              <SectionHeader title="Discover Online" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              >
                {discoverOnlineBooks.slice(0, 15).map((book) => (
                  <View key={book.key} style={{ width: 140 }}>
                    <BookCard
                      book={book}
                      onPress={() => handleCardPress(book)}
                      isFavorite={isInWishlist(book.key)}
                      onFavoritePress={() => handleFavoritePress(book)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {sectionHeaderToggle}
          {bookGrid}
        </ScrollView>
      </View>

      {/* Bottom Sheet / Modal */}
      <BookBottomSheet
        book={selectedBook}
        visible={bottomSheetVisible}
        onClose={handleCloseBottomSheet}
      />
    </SafeAreaView>
  );
};
