import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { WishlistItem, Book } from '../types';
import { useDatabase } from '../services/database';

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (book: Book) => void;
  removeFromWishlist: (key: string) => void;
  isInWishlist: (key: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const {
    getWishlist,
    addToWishlistDB,
    removeFromWishlistDB,
  } = useDatabase();

  // Initialize database and load wishlist on mount
  useEffect(() => {
    const init = async () => {
      try {
        const items = await getWishlist();
        setWishlist(items);
        console.log('[WishlistContext] Loaded', items.length, 'items from DB');
      } catch (error) {
        console.error('[WishlistContext] Error initializing:', error);
      }
    };
    init();
  }, []);

  const addToWishlist = useCallback(async (book: Book) => {
    const newItem: WishlistItem = {
      key: book.key,
      title: book.title,
      author_name: book.author_name,
      cover_i: book.cover_i,
      coverUrl: book.coverUrl || book.gutenbergMatch?.coverUrl,
      first_publish_year: book.first_publish_year,
      public_scan_b: book.public_scan_b || book.has_fulltext || !!book.gutenbergMatch,
      gutenbergId: book.gutenbergMatch?.id ?? null,
      summary: book.gutenbergMatch?.summary || book.description,
      subjects: book.gutenbergMatch?.subjects,
      gutenbergPublishYear: book.gutenbergMatch?.firstPublishYear,
      addedAt: Date.now(),
    };

    try {
      await addToWishlistDB(newItem);
      setWishlist(prev => {
        const exists = prev.find(item => item.key === book.key);
        if (exists) return prev;
        return [newItem, ...prev];
      });
    } catch (error) {
      console.error('[WishlistContext] Error adding to wishlist:', error);
    }
  }, []);

  const removeFromWishlist = useCallback(async (key: string) => {
    try {
      await removeFromWishlistDB(key);
      setWishlist(prev => prev.filter(item => item.key !== key));
    } catch (error) {
      console.error('[WishlistContext] Error removing from wishlist:', error);
    }
  }, []);

  const isInWishlist = useCallback(
    (key: string) => {
      return wishlist.some(item => item.key === key);
    },
    [wishlist],
  );

  const value = useMemo(
    () => ({
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }),
    [wishlist, addToWishlist, removeFromWishlist, isInWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
