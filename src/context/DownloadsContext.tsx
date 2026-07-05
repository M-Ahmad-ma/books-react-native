import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DownloadedBook } from '../types';
import { useDatabase } from '../services/database';

interface DownloadsContextType {
  downloadedBooks: DownloadedBook[];
  addDownload: (book: DownloadedBook) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
  updateDownloadProgress: (id: string, progress: number) => Promise<void>;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadedBooks, setDownloadedBooks] = useState<DownloadedBook[]>([]);
  const { getDownloadedBooks, addDownloadedBook, removeDownloadedBook, updateDownloadedProgressDB } = useDatabase();

  useEffect(() => {
    const init = async () => {
      try {
        const books = await getDownloadedBooks();
        setDownloadedBooks(books);
      } catch (error) {
        console.warn('[DownloadsContext] init error:', error);
      }
    };
    init();
  }, []);

  const addDownload = useCallback(async (book: DownloadedBook) => {
    try {
      await addDownloadedBook(book);
      setDownloadedBooks(prev => {
        const existing = prev.find(b => b.id === book.id);
        if (existing) return prev.map(b =>
          b.id === book.id
            ? { ...book, progress: b.progress ?? book.progress ?? 0, lastReadAt: b.lastReadAt }
            : b,
        );
        return [book, ...prev];
      });
    } catch (error) {
      console.warn('[DownloadsContext] addDownload error:', error);
    }
  }, []);

  const removeDownload = useCallback(async (id: string) => {
    try {
      await removeDownloadedBook(id);
      setDownloadedBooks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.warn('[DownloadsContext] removeDownload error:', error);
    }
  }, []);

  const isDownloaded = useCallback((id: string) => downloadedBooks.some(b => b.id === id), [downloadedBooks]);

  const updateDownloadProgress = useCallback(async (id: string, progress: number) => {
    try {
      await updateDownloadedProgressDB(id, progress);
      setDownloadedBooks(prev =>
        prev.map(b =>
          b.id === id ? { ...b, progress, lastReadAt: Date.now() } : b,
        ),
      );
    } catch (error) {
      console.warn('[DownloadsContext] updateDownloadProgress error:', error);
    }
  }, []);

  return (
    <DownloadsContext.Provider value={{ downloadedBooks, addDownload, removeDownload, isDownloaded, updateDownloadProgress }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error('useDownloads must be used within DownloadsProvider');
  return context;
};
