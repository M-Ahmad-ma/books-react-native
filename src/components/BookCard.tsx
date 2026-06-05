import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Bookmark, Heart } from 'lucide-react-native';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  isFavorite?: boolean;
  FeaturedCard?: boolean;
  onFavoritePress?: () => void;
  style?: object;
  progress?: number;
}

export const BookCard: React.FC<BookCardProps> = React.memo(
  ({ book, onPress, isFavorite = false, onFavoritePress, style, FeaturedCard = false, progress }) => {
    const [imgError, setImgError] = useState(false);

    const coverUrl = imgError
      ? 'https://via.placeholder.com/200x300?text=No+Cover'
      : book.coverUrl
        ? book.coverUrl
        : book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : 'https://via.placeholder.com/200x300?text=No+Cover';

    if (FeaturedCard) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.75}
          style={[{ borderRadius: 20, overflow: 'hidden' }, style]}
        >
          {/* Cover image fills the entire card */}
          <Image
            source={{ uri: coverUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />

          {/* Read/Web chip */}
          <View
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
            }}
          >
            <View
              style={{
                backgroundColor: book.gutenbergMatch ? '#16a34a' : '#2563eb',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                }}
              >
                {book.gutenbergMatch ? 'READ' : 'WEB'}
              </Text>
            </View>
          </View>

          {/* Favorite button */}
          {onFavoritePress && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFavorite ? 'rgba(179, 38, 30, 0.15)' : 'rgba(255,255,255,0.95)',
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
              onPress={onFavoritePress}
            >
              <Bookmark
                size={18}
                color={isFavorite ? '#B3261E' : '#49454F'}
                fill={isFavorite ? '#B3261E' : 'none'}
              />
            </TouchableOpacity>
          )}

          {/* Bottom overlay content */}
          <View
            style={{
              position: 'absolute',
              bottom: 14,
              left: 12,
              right: 12,
            }}
          >
            {/* Year pill + Read/Web chip row */}
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
                marginBottom: 6,
                gap: 6,
              }}
            >
              {book.first_publish_year && (
                <View
                  style={{
                    backgroundColor: '#FFB3C6',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#1a1a1a',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                    }}
                  >
                    {book.first_publish_year}
                  </Text>
                </View>
              )}
              <View
                style={{
                  backgroundColor: book.gutenbergMatch ? '#16a34a' : '#2563eb',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: 0.6,
                  }}
                >
                  {book.gutenbergMatch ? 'READ' : 'WEB'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text
              numberOfLines={2}
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#FFFFFF',
                lineHeight: 20,
                marginBottom: 3,
              }}
            >
              {book.title}
            </Text>

            {/* Author */}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: '400',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {book.author_name?.[0] || 'Unknown Author'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // --- Standard (non-featured) card ---
    return (
      <TouchableOpacity
        onPress={onPress}
        className="w-[100%] mb-5"
        activeOpacity={0.75}
        style={style}
      >
        <View className="relative">
          <View className="rounded-[16px] overflow-hidden bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark shadow-elevation-2">
            <Image
              source={{ uri: coverUrl }}
              className="w-full aspect-[0.65]"
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          </View>

          {/* Read/Web chip */}
          <View className="absolute top-3 left-3">
            <View
              className={`px-2 py-1 rounded-[4px] ${book.gutenbergMatch ? 'bg-green-600' : 'bg-blue-600'}`}
            >
              <Text className="text-[10px] font-semibold text-white">
                {book.gutenbergMatch ? 'Read' : 'Web'}
              </Text>
            </View>
          </View>

          {onFavoritePress && (
            <TouchableOpacity
              className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center shadow-elevation-2"
              style={{
                backgroundColor: isFavorite
                  ? 'rgba(179, 38, 30, 0.15)'
                  : 'rgba(255, 255, 255, 0.95)',
              }}
              activeOpacity={0.8}
              onPress={onFavoritePress}
            >
              <Bookmark
                size={20}
                color={isFavorite ? '#B3261E' : '#49454F'}
                fill={isFavorite ? '#B3261E' : 'none'}
              />
            </TouchableOpacity>
          )}

          {book.first_publish_year && (
            <View className="absolute bottom-3 left-3 bg-md-surface-light dark:bg-md-surfaceVariant-dark px-2 py-1 rounded-[4px]">
              <Text className="text-[10px] font-medium text-md-onSurface-light dark:text-md-onSurface-dark">
                {book.first_publish_year}
              </Text>
            </View>
          )}

          {progress !== undefined && progress > 0 && (
            <View className="absolute bottom-0 left-0 right-0">
              <View className="h-1 bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark">
                <View
                  className="h-full bg-md-primary-light dark:bg-md-primary-dark"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          )}
        </View>

        <View className="mt-3 px-1">
          <Text
            className="text-md-title-small text-md-onSurface-light dark:text-md-onSurface-dark font-medium"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            className="text-md-body-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mt-1"
            numberOfLines={1}
          >
            {book.author_name?.[0] || 'Unknown Author'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.book.key === nextProps.book.key &&
      prevProps.isFavorite === nextProps.isFavorite
    );
  },
);
