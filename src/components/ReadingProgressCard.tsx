import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  BookOpen,
  ChevronRight,
  Clock,

} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useReading } from '../context/ReadingContext';
import { getCoverUrl } from '../api/openLibrary';

const getTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

interface ReadingProgressCardProps {
  onBookPress?: (book: any) => void;
  onSeeAllPress?: () => void;
}

export const ReadingProgressCard: React.FC<ReadingProgressCardProps> = ({ onBookPress, onSeeAllPress }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { readingBooks } = useReading();

  const hasAnyBooks = readingBooks.length > 0;

  const inProgress = readingBooks
    .filter(b => b.progress !== undefined && b.progress > 0 && b.progress < 100)
    .sort((a, b) => {
      const aLast = b.lastReadAt || b.addedAt;
      const bLast = a.lastReadAt || a.addedAt;
      return aLast - bLast;
    });

  const accentColor = isDark ? '#D0BCFF' : '#6750A4';
  const cardBg = isDark ? '#2B2930' : '#F5F0FF';
  const progressTrack = isDark ? '#48464C' : '#E7DEF8';
  const progressFill = isDark ? '#D0BCFF' : '#6750A4';
  const muted = isDark ? '#938F99' : '#79747E';
  const onSurface = isDark ? '#E6E1E5' : '#1C1B1F';
  if (!hasAnyBooks) return null;

  if (inProgress.length === 0) return null;

  if (hasAnyBooks) {
    return (
      <View className="mb-5">
        <View className="flex-row items-center justify-between px-5 mb-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark font-semibold">
              Continue Reading
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onSeeAllPress?.()}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Text
              className="text-md-label-medium mr-1"
              style={{ color: accentColor }}
            >
              See all
            </Text>
            <ChevronRight size={16} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          decelerationRate="fast"
          snapToInterval={200}
        >
          {inProgress.map(book => {
            const progress = book.progress ?? 0;
            const timeAgo = book.lastReadAt ? getTimeAgo(book.lastReadAt) : null;
            const coverUrl = book.cover_i
              ? getCoverUrl(book.cover_i, 'M')
              : book.coverUrl || null;

            return (
              <TouchableOpacity
                key={book.id}
                activeOpacity={0.85}
                onPress={() => onBookPress?.(book)}
                style={{
                  width: 188,
                  backgroundColor: cardBg,
                  borderRadius: 20,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-row p-3 pb-0">
                  <View
                    className="w-[52px] h-[72px] rounded-[10px] overflow-hidden"
                    style={{
                      backgroundColor: isDark ? '#3B3840' : '#E7DEF8',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    {coverUrl ? (
                      <Image
                        source={{ uri: coverUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <BookOpen size={18} color={muted} />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-3 justify-center">
                    <Text
                      className="text-md-label-medium font-semibold"
                      style={{ color: onSurface, lineHeight: 16 }}
                      numberOfLines={2}
                    >
                      {book.title}
                    </Text>
                    <Text
                      className="text-[11px] mt-0.5"
                      style={{ color: muted }}
                      numberOfLines={1}
                    >
                      {book.author_name?.join(', ') || 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View className="px-3 pt-3 pb-3">
                  <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: progressTrack }}>
                    <View
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        height: '100%',
                        backgroundColor: progressFill,
                        borderRadius: 999,
                      }}
                    />
                  </View>
                  <View className="flex-row items-center justify-between mt-1.5">
                    <Text
                      className="text-[11px] font-semibold"
                      style={{ color: progressFill }}
                    >
                      {Math.round(progress)}%
                    </Text>
                    {timeAgo && (
                      <View className="flex-row items-center gap-1">
                        <Clock size={10} color={muted} />
                        <Text className="text-[10px]" style={{ color: muted }}>
                          {timeAgo}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return null;
};
