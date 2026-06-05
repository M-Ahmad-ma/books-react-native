import React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { Book } from '../types';
import { BookCard } from './BookCard';
import { SectionHeader } from './SectionHeader';
import { SkeletonBookCard } from './Skeleton';
import { isTablet } from '@/utils';

interface FeaturedSectionProps {
  title: string;
  books: Book[];
  isLoading?: boolean;
  onBookPress: (book: Book) => void;
  onFavoritePress: (book: Book) => void;
  isInWishlist: (key: string) => boolean;
  onSeeAllPress?: () => void;
  FeaturedCard?: boolean;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  title,
  books,
  isLoading = false,
  onBookPress,
  onFavoritePress,
  isInWishlist,
  onSeeAllPress,
}) => {
  const { width } = useWindowDimensions();
  const tablet = isTablet(width);

  // Width and height sized to give a portrait book-cover ratio (~1.4:1 h/w)
  const cardWidth = tablet ? 400 : 160;
  const cardHeight = tablet ? 220 : 224;

  if (isLoading) {
    return (
      <View className="mb-6">
        <SectionHeader title={title} showSeeAll={false} />
        <View className="flex-row px-5 gap-3">
          <SkeletonBookCard />
          <SkeletonBookCard />
          <SkeletonBookCard />
        </View>
      </View>
    );
  }

  if (books.length === 0) return null;

  return (
    <View className="mb-1 mt-4">
      <SectionHeader title={title} onSeeAllPress={onSeeAllPress} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {books.map((book) => (
          <BookCard
            key={book.key}
            book={book}
            onPress={() => onBookPress(book)}
            isFavorite={isInWishlist(book.key)}
            onFavoritePress={() => onFavoritePress(book)}
            FeaturedCard={true}
            style={{ width: cardWidth, height: cardHeight }}
          />
        ))}
      </ScrollView>
    </View>
  );
};
