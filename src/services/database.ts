import { useSQLiteContext } from 'expo-sqlite';
import { WishlistItem, ReadingBook, DownloadedBook, Book } from '../types';

const stringifyAuthors = (authors?: string[]): string | null => {
  return authors ? JSON.stringify(authors) : null;
};

const parseAuthors = (authorsStr: string | null): string[] | undefined => {
  if (!authorsStr) return undefined;
  try {
    return JSON.parse(authorsStr);
  } catch {
    return undefined;
  }
};

export function useDatabase() {
  const db = useSQLiteContext();

  const initDatabase = async () => {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wishlist (
      key TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      first_publish_year INTEGER,
      addedAt INTEGER
    )
  `);

    // Wishlist migrations — check existing columns before ALTER TABLE
    const existingColumns = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM pragma_table_info('wishlist')"
    );
    const columnNames = new Set(existingColumns.map(c => c.name));

    const migrations: { name: string; sql: string }[] = [
      { name: 'public_scan_b', sql: 'ALTER TABLE wishlist ADD COLUMN public_scan_b INTEGER DEFAULT 0' },
      { name: 'gutenbergId', sql: 'ALTER TABLE wishlist ADD COLUMN gutenbergId INTEGER' },
      { name: 'summary', sql: 'ALTER TABLE wishlist ADD COLUMN summary TEXT' },
      { name: 'subjects', sql: 'ALTER TABLE wishlist ADD COLUMN subjects TEXT' },
      { name: 'gutenbergPublishYear', sql: 'ALTER TABLE wishlist ADD COLUMN gutenbergPublishYear INTEGER' },
    ];

    for (const { name, sql } of migrations) {
      if (!columnNames.has(name)) {
        await db.execAsync(sql);
      }
    }

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reading_books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      epubUrl TEXT NOT NULL,
      htmlUrl TEXT,
      gutenbergId TEXT,
      addedAt INTEGER,
      progress REAL DEFAULT 0,
      lastReadAt INTEGER
    )
  `);

    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS downloaded_books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_name TEXT,
      cover_i INTEGER,
      coverUrl TEXT,
      format TEXT NOT NULL,
      filePath TEXT NOT NULL,
      gutenbergId INTEGER,
      downloadedAt INTEGER,
      progress REAL DEFAULT 0,
      lastReadAt INTEGER
    )
  `);

    // Migrate existing downloaded_books — add progress columns if missing
    const dlColumns = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM pragma_table_info('downloaded_books')"
    );
    const dlColumnNames = new Set(dlColumns.map(c => c.name));
    const dlMigrations: { name: string; sql: string }[] = [
      { name: 'progress', sql: 'ALTER TABLE downloaded_books ADD COLUMN progress REAL DEFAULT 0' },
      { name: 'lastReadAt', sql: 'ALTER TABLE downloaded_books ADD COLUMN lastReadAt INTEGER' },
    ];
    for (const { name, sql } of dlMigrations) {
      if (!dlColumnNames.has(name)) {
        await db.execAsync(sql);
      }
    }
  };
  const getWishlist = async (): Promise<WishlistItem[]> => {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM wishlist ORDER BY addedAt DESC',
    );

    return rows.map((row: any) => ({
      key: row.key,
      title: row.title,
      author_name: parseAuthors(row.author_name),
      cover_i: row.cover_i,
      coverUrl: row.coverUrl,
      first_publish_year: row.first_publish_year,
      public_scan_b: row.public_scan_b === 1,
      gutenbergId: row.gutenbergId,
      summary: row.summary,
      subjects: row.subjects ? JSON.parse(row.subjects) : undefined,
      gutenbergPublishYear: row.gutenbergPublishYear,
      addedAt: row.addedAt,
    })) as WishlistItem[];

  };

  const addToWishlistDB = async (item: WishlistItem): Promise<void> => {
    await db.runAsync(
      `INSERT OR REPLACE INTO wishlist (key, title, author_name, cover_i, coverUrl, first_publish_year, public_scan_b, gutenbergId, summary, subjects, gutenbergPublishYear, addedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.key,
        item.title,
        stringifyAuthors(item.author_name),
        item.cover_i || null,
        item.coverUrl || null,
        item.first_publish_year || null,
        item.public_scan_b ? 1 : 0,
        item.gutenbergId || null,
        item.summary || null,
        item.subjects ? JSON.stringify(item.subjects) : null,
        item.gutenbergPublishYear || null,
        item.addedAt,
      ],
    );
  };

  const removeFromWishlistDB = async (key: string): Promise<void> => {
    await db.runAsync('DELETE FROM wishlist WHERE key = ?', [key]);
  };

  const isInWishlistDB = async (key: string): Promise<boolean> => {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM wishlist WHERE key = ?',
      [key],
    );
    return (result?.count ?? 0) > 0;
  };

  const getReadingBooks = async (): Promise<ReadingBook[]> => {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM reading_books ORDER BY addedAt DESC',
    );
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      author_name: parseAuthors(row.author_name),
      cover_i: row.cover_i,
      coverUrl: row.coverUrl,
      epubUrl: row.epubUrl,
      htmlUrl: row.htmlUrl,
      gutenbergId: row.gutenbergId,
      addedAt: row.addedAt,
      progress: row.progress,
      lastReadAt: row.lastReadAt,
    })) as ReadingBook[];
  };

  const addToReadingDB = async (book: ReadingBook): Promise<void> => {
    await db.runAsync(
      `INSERT OR REPLACE INTO reading_books 
       (id, title, author_name, cover_i, coverUrl, epubUrl, htmlUrl, gutenbergId, addedAt, progress, lastReadAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        stringifyAuthors(book.author_name),
        book.cover_i || null,
        book.coverUrl || null,
        book.epubUrl,
        book.htmlUrl || null,
        book.gutenbergId || null,
        book.addedAt,
        book.progress || 0,
        book.lastReadAt || null,
      ],
    );
  };

  const removeFromReadingDB = async (id: string): Promise<void> => {
    await db.runAsync('DELETE FROM reading_books WHERE id = ?', [id]);
  };

  const getReadingBookDB = async (
    id: string,
  ): Promise<ReadingBook | undefined> => {
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM reading_books WHERE id = ?',
      [id],
    );

    if (!row) return undefined;

    return {
      id: row.id,
      title: row.title,
      author_name: parseAuthors(row.author_name),
      cover_i: row.cover_i,
      epubUrl: row.epubUrl,
      htmlUrl: row.htmlUrl,
      gutenbergId: row.gutenbergId,
      addedAt: row.addedAt,
      progress: row.progress,
      lastReadAt: row.lastReadAt,
    } as ReadingBook;
  };

  const updateProgressDB = async (
    id: string,
    progress: number,
  ): Promise<void> => {
    await db.runAsync(
      'UPDATE reading_books SET progress = ?, lastReadAt = ? WHERE id = ?',
      [progress, Date.now(), id],
    );
  };

  const isInReadingDB = async (id: string): Promise<boolean> => {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM reading_books WHERE id = ?',
      [id],
    );
    return (result?.count ?? 0) > 0;
  };

  const getDownloadedBooks = async (): Promise<DownloadedBook[]> => {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM downloaded_books ORDER BY downloadedAt DESC',
    );
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      author_name: parseAuthors(row.author_name),
      cover_i: row.cover_i,
      coverUrl: row.coverUrl,
      format: row.format,
      filePath: row.filePath,
      gutenbergId: row.gutenbergId,
      downloadedAt: row.downloadedAt,
      progress: row.progress,
      lastReadAt: row.lastReadAt,
    })) as DownloadedBook[];
  };

  const addDownloadedBook = async (book: DownloadedBook): Promise<void> => {
    await db.runAsync(
      `INSERT OR REPLACE INTO downloaded_books
       (id, title, author_name, cover_i, coverUrl, format, filePath, gutenbergId, downloadedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        stringifyAuthors(book.author_name),
        book.cover_i || null,
        book.coverUrl || null,
        book.format,
        book.filePath,
        book.gutenbergId || null,
        book.downloadedAt,
      ],
    );
  };

  const removeDownloadedBook = async (id: string): Promise<void> => {
    await db.runAsync('DELETE FROM downloaded_books WHERE id = ?', [id]);
  };

  const isDownloadedDB = async (id: string): Promise<boolean> => {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM downloaded_books WHERE id = ?',
      [id],
    );
    return (result?.count ?? 0) > 0;
  };

  const updateDownloadedProgressDB = async (
    id: string,
    progress: number,
  ): Promise<void> => {
    await db.runAsync(
      'UPDATE downloaded_books SET progress = ?, lastReadAt = ? WHERE id = ?',
      [progress, Date.now(), id],
    );
  };

  return {
    initDatabase,
    getWishlist,
    addToWishlistDB,
    removeFromWishlistDB,
    isInWishlistDB,
    getReadingBooks,
    addToReadingDB,
    removeFromReadingDB,
    getReadingBookDB,
    updateProgressDB,
    isInReadingDB,
    getDownloadedBooks,
    addDownloadedBook,
    removeDownloadedBook,
    isDownloadedDB,
    updateDownloadedProgressDB,
  };
}
