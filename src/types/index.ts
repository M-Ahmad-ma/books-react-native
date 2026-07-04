export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  coverUrl?: string;
  cover_edition_key?: string;
  subject?: string[];
  edition_count?: number;
  public_scan_b: boolean;
  has_fulltext?: boolean;
  ebook_access?: string;
  series_key?: number;
  isbn?: string[];
  ratings_average?: number;
  description?: string;
  olid?: string;
  gutenbergMatch?: GutenbergBook | null;
}

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  epubUrl: string;
  summary?: string;
  subjects?: string[];
  firstPublishYear?: number;
}

export interface SearchResponse {
  numFound: number;
  start: number;
  docs: Book[];
}

export interface WishlistItem {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  coverUrl?: string;
  first_publish_year?: number;
  public_scan_b?: boolean;
  gutenbergId?: number | null;
  summary?: string;
  subjects?: string[];
  gutenbergPublishYear?: number;
  addedAt: number;
}

export interface DownloadFormat {
  format: string;
  url: string;
  mimeType: string;
}

export interface DownloadedBook {
  id: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  coverUrl?: string;
  format: string;
  filePath: string;
  gutenbergId?: number;
  downloadedAt: number;
  progress?: number;
  lastReadAt?: number;
}

export interface ReadingBook {
  id: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  coverUrl?: string;
  epubUrl: string;
  htmlUrl?: string;
  gutenbergId?: string;
  addedAt: number;
  lastReadAt?: number;
  progress?: number;
}

export type RootTabParamList = {
  Home: undefined;
  Wishlist: undefined;
  Reading: undefined;
  About: undefined;
};

export type ReadingStackParamList = {
  ReadingList: undefined;
  ReaderView: { bookId: string; localFile?: string; format?: string };
};
