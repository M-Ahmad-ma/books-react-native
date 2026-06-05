import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DownloadedBook } from '../types';
import { useDatabase } from '../services/database';

interface DownloadsContextType {
  downloadedBooks: DownloadedBook[];
  addDownload: (book: DownloadedBook) => Promise<void>;
  removeDownload: (id: string) => Promise<void>;
  isDownloaded: (id: string) => boolean;
}

const DownloadsContext = createContext<DownloadsContextType | undefined>(undefined);

export const DownloadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadedBooks, setDownloadedBooks] = useState<DownloadedBook[]>([]);
  const { getDownloadedBooks, addDownloadedBook, removeDownloadedBook } = useDatabase();

  useEffect(() => {
    const init = async () => {
      try {
        const books = await getDownloadedBooks();
        setDownloadedBooks(books);
        console.log(`[DownloadsContext] Loaded ${books.length} downloaded books`);
      } catch (error) {
        console.error('[DownloadsContext] Error initializing:', error);
      }
    };
    init();
  }, []);

  const addDownload = useCallback(async (book: DownloadedBook) => {
    try {
      await addDownloadedBook(book);
      setDownloadedBooks(prev => {
        const exists = prev.find(b => b.id === book.id);
        if (exists) return prev.map(b => b.id === book.id ? book : b);
        return [book, ...prev];
      });
    } catch (error) {
      console.error('[DownloadsContext] Error adding download:', error);
    }
  }, []);

  const removeDownload = useCallback(async (id: string) => {
    try {
      await removeDownloadedBook(id);
      setDownloadedBooks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('[DownloadsContext] Error removing download:', error);
    }
  }, []);

  const isDownloaded = useCallback((id: string) => downloadedBooks.some(b => b.id === id), [downloadedBooks]);

  return (
    <DownloadsContext.Provider value={{ downloadedBooks, addDownload, removeDownload, isDownloaded }}>
      {children}
    </DownloadsContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadsContext);
  if (!context) throw new Error('useDownloads must be used within DownloadsProvider');
  return context;
};
