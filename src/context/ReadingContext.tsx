import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { ReadingBook, Book } from '../types';
import { useDatabase } from '../services/database';

interface ReadingContextType {
  readingBooks: ReadingBook[];
  isLoading: boolean;
  addToReading: (book: Book, epubUrl: string) => void;
  removeFromReading: (id: string) => void;
  getReadingBook: (id: string) => ReadingBook | undefined;
  updateProgress: (id: string, progress: number) => void;
  isInReading: (id: string) => boolean;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const extractGutenbergId = (epubUrl: string): string | undefined => {
  const match = epubUrl.match(/\/(\d+)\./);
  return match ? match[1] : undefined;
};

export const getHtmlUrl = (epubUrl: string): string | undefined => {
  const gutenbergId = extractGutenbergId(epubUrl);
  if (!gutenbergId) return undefined;

  const htmlUrl = `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`;

  return htmlUrl;
};

export const getFallbackUrl = (gutenbergId: string): string | undefined => {
  return `https://www.gutenberg.org/ebooks/${gutenbergId}.html`;
};

export const ReadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [readingBooks, setReadingBooks] = useState<ReadingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    getReadingBooks: fetchReadingBooks,
    addToReadingDB,
    removeFromReadingDB,
    updateProgressDB,
  } = useDatabase();

  // Initialize database and load reading books on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const books = await fetchReadingBooks();
        setReadingBooks(books);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const addToReading = useCallback(async (book: Book, epubUrl: string) => {
    const gutenbergId = extractGutenbergId(epubUrl);
    const computedHtmlUrl = gutenbergId ? getHtmlUrl(epubUrl) : undefined;

    const fallbackUrl = gutenbergId
      ? `https://www.gutenberg.org/ebooks/${gutenbergId}.html`
      : undefined;

    const newBook: ReadingBook = {
      id: book.key,
      title: book.title,
      author_name: book.author_name,
      cover_i: book.cover_i,
      coverUrl: book.coverUrl || book.gutenbergMatch?.coverUrl,
      epubUrl,
      htmlUrl: computedHtmlUrl || fallbackUrl,
      gutenbergId,
      addedAt: Date.now(),
      progress: 0,
    };

    try {
      await addToReadingDB(newBook);
      setReadingBooks(prev => {
        const exists = prev.find(b => b.id === book.key);
        if (exists) return prev;
        return [newBook, ...prev];
      });
    } catch (error) {
    }
  }, []);

  const removeFromReading = useCallback(async (id: string) => {
    try {
      await removeFromReadingDB(id);
      setReadingBooks(prev => prev.filter(book => book.id !== id));
    } catch (error) {
    }
  }, []);

  const getReadingBook = useCallback((id: string) => {
    return readingBooks.find(book => book.id === id);
  }, [readingBooks]);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    try {
      await updateProgressDB(id, progress);
      setReadingBooks(prev =>
        prev.map(book =>
          book.id === id ? { ...book, progress, lastReadAt: Date.now() } : book,
        ),
      );
    } catch (error) {
    }
  }, []);

  const isInReading = useCallback((id: string) => readingBooks.some(book => book.id === id), [readingBooks]);

  return (
    <ReadingContext.Provider
      value={{
        readingBooks,
        isLoading,
        addToReading,
        removeFromReading,
        getReadingBook,
        updateProgress,
        isInReading,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = () => {
  const context = useContext(ReadingContext);
  if (!context)
    throw new Error('useReading must be used within ReadingProvider');
  return context;
};
