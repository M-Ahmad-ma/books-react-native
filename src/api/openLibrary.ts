import { SearchResponse, Book, DownloadFormat } from '../types';
import { getGutenbergEpubUrl } from './gutenberg';

const BASE_URL = 'https://openlibrary.org';
const SEARCH_URL = `${BASE_URL}/search.json`;
const GUTENBERG_BASE = 'https://www.gutenberg.org';
const GUTENBERG_API = `${GUTENBERG_BASE}/ebooks`;
const GUTENDEX_API = 'https://gutendex.com/books';

const log = (tag: string, message: string, data?: any) => {
  if (data) {
    console.log(`[${tag}] ${message}:`, data);
  } else {
    console.log(`[${tag}] ${message}`);
  }
};

export const getCoverUrl = (
  coverId: number,
  size: 'S' | 'M' | 'L' = 'M',
): string => {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

const normalizeForMatching = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

export const KNOWN_PUBLIC_DOMAIN_BOOKS = [
  { title: 'Pride and Prejudice', gutenbergId: 1342 },
  { title: 'Emma', gutenbergId: 158 },
  { title: 'Moby-Dick', gutenbergId: 15 },
  { title: 'Jane Eyre', gutenbergId: 1260 },
  { title: 'Wuthering Heights', gutenbergId: 768 },
  { title: 'The Great Gatsby', gutenbergId: 6432 },
  { title: 'Frankenstein', gutenbergId: 84 },
  { title: 'Dracula', gutenbergId: 345 },
  { title: 'The Adventures of Sherlock Holmes', gutenbergId: 1661 },
  { title: 'A Tale of Two Cities', gutenbergId: 98 },
  { title: 'Great Expectations', gutenbergId: 1400 },
  { title: 'Oliver Twist', gutenbergId: 130 },
  { title: 'David Copperfield', gutenbergId: 196 },
  { title: 'War and Peace', gutenbergId: 2600 },
  { title: 'Anna Karenina', gutenbergId: 1399 },
  { title: 'The Iliad', gutenbergId: 1727 },
  { title: 'The Odyssey', gutenbergId: 1727 },
  { title: 'Don Quixote', gutenbergId: 996 },
  { title: 'The Count of Monte Cristo', gutenbergId: 1184 },
  { title: 'Les Misérables', gutenbergId: 135 },
  { title: 'The Picture of Dorian Gray', gutenbergId: 174 },
  { title: 'A Christmas Carol', gutenbergId: 46 },
  { title: 'The Secret Garden', gutenbergId: 113 },
  { title: 'Little Women', gutenbergId: 37134 },
  { title: 'Anne of Green Gables', gutenbergId: 2852 },
  { title: 'Treasure Island', gutenbergId: 46 },
  { title: 'Robinson Crusoe', gutenbergId: 1729 },
  { title: 'The Adventures of Tom Sawyer', gutenbergId: 74 },
  { title: 'Adventures of Huckleberry Finn', gutenbergId: 76 },
  { title: 'The Call of the Wild', gutenbergId: 215 },
  { title: 'White Fang', gutenbergId: 216 },
  { title: 'Peter Pan', gutenbergId: 216 },
  { title: 'Alice in Wonderland', gutenbergId: 11 },
  { title: 'Through the Looking-Glass', gutenbergId: 12 },
  { title: 'Pinocchio', gutenbergId: 500 },
  { title: 'Roughing It', gutenbergId: 3176 },
  { title: 'The Jungle Book', gutenbergId: 236 },
  { title: 'Just So Stories', gutenbergId: 18928 },
  { title: 'Kim', gutenbergId: 2096 },
  { title: 'The Man Who Would Be King', gutenbergId: 1721 },
  { title: 'Silas Marner', gutenbergId: 236 },
  { title: 'Middlemarch', gutenbergId: 1459 },
  { title: 'The Mill on the Floss', gutenbergId: 8442 },
  { title: 'Strange Case of Dr Jekyll and Mr Hyde', gutenbergId: 43 },
  { title: 'Kidnapped', gutenbergId: 67968 },
  { title: 'Black Beauty', gutenbergId: 113 },
  { title: 'The Sea Wolf', gutenbergId: 1904 },
  { title: 'The Prince and the Pauper', gutenbergId: 2939 },
  { title: 'A Connecticut Yankee in King Arthurs Court', gutenbergId: 86 },
  { title: 'Life on the Mississippi', gutenbergId: 245 },
  { title: 'The Three Musketeers', gutenbergId: 135 },
  { title: 'Twenty Years After', gutenbergId: 2591 },
  { title: 'The Black Tulip', gutenbergId: 4942 },
  { title: 'The Importance of Being Earnest', gutenbergId: 844 },
  { title: 'Little Men', gutenbergId: 10514 },
  { title: 'A Little Princess', gutenbergId: 20760 },
  { title: 'Anne of Avonlea', gutenbergId: 2853 },
  { title: 'Anne of the Island', gutenbergId: 4458 },
  { title: 'Bleak House', gutenbergId: 1023 },
  { title: 'Hard Times', gutenbergId: 2252 },
  { title: 'Little Dorrit', gutenbergId: 786 },
  { title: 'Our Mutual Friend', gutenbergId: 8839 },
  { title: 'The Death of Ivan Ilyich', gutenbergId: 6918 },
  { title: 'Resurrection', gutenbergId: 7222 },
  { title: 'The Last Man', gutenbergId: 18247 },
  { title: 'The Hunchback of Notre Dame', gutenbergId: 17589 },
  { title: 'Toilers of the Sea', gutenbergId: 4659 },
  { title: 'A Childs Garden of Verses', gutenbergId: 20445 },
  { title: 'The Second Jungle Book', gutenbergId: 237 },
  { title: 'The Lost World', gutenbergId: 171 },
  { title: 'A Study in Scarlet', gutenbergId: 244 },
  { title: 'The Hound of the Baskervilles', gutenbergId: 2852 },
  { title: 'The Memoirs of Sherlock Holmes', gutenbergId: 8343 },
];

export const isPublicDomainBook = (book: Book): boolean => {
  const normalizedTitle = normalizeForMatching(book.title);
  const normalizedKey = normalizeForMatching(book.key);

  const match = KNOWN_PUBLIC_DOMAIN_BOOKS.some(pd => {
    const normalizedPdTitle = normalizeForMatching(pd.title);
    return (
      normalizedTitle === normalizedPdTitle ||
      normalizedTitle.includes(normalizedPdTitle) ||
      normalizedPdTitle.includes(normalizedTitle) ||
      normalizedKey.includes(normalizedPdTitle)
    );
  });

  return match;
};

export const filterPublicDomainBooks = (books: Book[]): Book[] => {
  const results = books.filter(book => isPublicDomainBook(book));
  log(
    'OpenLibrary',
    `Filter: ${books.length} → ${results.length} (public domain)`,
  );
  return results;
};

export const getGutenbergId = (book: Book): number | null => {
  const normalizedTitle = normalizeForMatching(book.title);

  for (const pd of KNOWN_PUBLIC_DOMAIN_BOOKS) {
    const normalizedPdTitle = normalizeForMatching(pd.title);
    if (
      normalizedTitle === normalizedPdTitle ||
      normalizedTitle.includes(normalizedPdTitle) ||
      normalizedPdTitle.includes(normalizedTitle)
    ) {
      return pd.gutenbergId;
    }
  }
  return null;
};

export const searchBooks = async (
  query: string,
  limit = 20,
  offset = 0,
  subject?: string,
): Promise<SearchResponse> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const mappedSubject =
      subject && subject !== 'all'
        ? OL_SUBJECT_MAP[subject] || subject.replace(/_/g, ' ')
        : undefined;
    const subjectParam = mappedSubject
      ? `&subject=${encodeURIComponent(mappedSubject)}`
      : '';
    const url = `${SEARCH_URL}?q=${encodedQuery}&limit=${limit}&offset=${offset}${subjectParam}&fields=key,title,author_name,author_key,first_publish_year,cover_i,cover_edition_key,subject,edition_count,rating_average,olid,public_scan_b,has_fulltext,ebook_access`;

    log(
      'OpenLibrary',
      `SEARCH: "${query}" (limit: ${limit}, offset: ${offset})`,
      url,
    );

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    log(
      'OpenLibrary',
      `Results: ${data.numFound} total (returned ${data.docs?.length || 0})`,
    );

    return data as SearchResponse;
  } catch (error) {
    console.error('[OpenLibrary] Search error:', error);
    throw error;
  }
};

export const getBookDetails = async (workId: string): Promise<Book> => {
  try {
    const url = `${BASE_URL}/works/${workId}.json`;
    log('OpenLibrary', `DETAILS: ${workId}`, url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log("DATA", data)
    return data;
  } catch (error) {
    console.error('[OpenLibrary] Details error:', error);
    throw error;
  }
};

// ── Fixed getTrendingBooks ────────────────────────────────────────

/**
 * Map front‑end filter IDs to Open Library subjects.
 * Open Library uses spaces (and sometimes hyphens) in subject names.
 */
const OL_SUBJECT_MAP: Record<string, string> = {
  fiction: 'fiction',
  drama: 'drama',
  humor: 'humor',
  science_fiction: 'science fiction',
  mystery: 'mystery',
  adventure: 'adventure',
  romance: 'romance',
  fantasy: 'fantasy',
  historical_fiction: 'historical fiction',
  horror: 'horror',
  poetry: 'poetry',
  philosophy: 'philosophy',
  psychology: 'psychology',
  science: 'science',
  history: 'history',
};

export const getTrendingBooks = async (
  limit = 20,
  offset = 0,
  subject?: string,
): Promise<Book[]> => {
  try {
    let url: string;

    if (!subject || subject === 'all') {
      // Use search API with trending sort - the /trending endpoint is broken
      url = `${SEARCH_URL}?q=*:*&sort=trending&limit=${limit}&offset=${offset}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,ebook_access,public_scan_b,series_key`;
      log('OpenLibrary', `TRENDING (global, limit: ${limit})`, url);
    } else {
      // Filtered – use search with subject, sorted by trending
      const mappedSubject = OL_SUBJECT_MAP[subject] || subject.replace(/_/g, ' ');
      url = `${SEARCH_URL}?q=subject:${encodeURIComponent(mappedSubject)}&limit=${limit}&offset=${offset}&sort=trending&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,ebook_access`;
      log('OpenLibrary', `TRENDING (subject: ${mappedSubject})`, url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Open Library search returns `docs`
    const books = data.docs || [];
    const readable = books.filter((b: Book) => isPublicDomainBook(b));
    const notReadable = books.length - readable.length;

    log(
      'OpenLibrary',
      `Trending: ${books.length} total | Readable (Public Domain): ${readable.length} | Premium: ${notReadable}`,
    );

    console.log("Books on line 271 openlibrary.ts", books, "data", data)

    return books;
  } catch (error) {
    console.error('[OpenLibrary] Trending error:', error);
    throw error;
  }
};

export const getBookCoverUrl = (
  book: Book,
  size: 'S' | 'M' | 'L' = 'M',
): string | null => {
  if (book.cover_i) {
    return getCoverUrl(book.cover_i, size);
  }
  return null;
};


export const getBookEditions = async (workKey: string): Promise<any[]> => {
  try {
    const url = `${BASE_URL}${workKey}/editions.json?limit=5`;
    log('OpenLibrary', `FETCHING EDITIONS: ${workKey}`, url);
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entries || [];
  } catch {
    return [];
  }
};

const tryHead = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
};

const resolveUrl = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    log('OpenLibrary', `Resolved ${url} → ${res.url}`);
    return res.url || url;
  } catch {
    return url;
  }
};

const GUTENBERG_DOWNLOAD_FORMATS: Record<string, string> = {
  'application/epub+zip': 'EPUB',
  'text/html': 'HTML',
  'text/plain; charset=us-ascii': 'TXT',
  'text/plain; charset=utf-8': 'TXT',
  'application/x-mobipocket-ebook': 'Kindle',
};

export const getDownloadFormats = async (book: Book): Promise<DownloadFormat[]> => {
  const formats: DownloadFormat[] = [];
  const seen = new Set<string>();
  const gId = getGutenbergId(book);

  const add = (fmt: string, url: string, mime: string) => {
    if (!seen.has(fmt)) {
      seen.add(fmt);
      formats.push({ format: fmt, url, mimeType: mime });
    }
  };

  // 1. Gutenberg — use Gutendex for real URLs
  if (gId) {
    log('OpenLibrary', `Fetching Gutendex formats for Gutenberg ID: ${gId}`);
    try {
      const gRes = await fetch(`${GUTENDEX_API}/${gId}`);
      if (gRes.ok) {
        const gData = await gRes.json();
        log('OpenLibrary', `Gutendex formats available:`, Object.keys(gData.formats || {}));
        for (const [mime, rawUrl] of Object.entries(gData.formats || {})) {
          const fmt = GUTENBERG_DOWNLOAD_FORMATS[mime];
          if (fmt && typeof rawUrl === 'string') {
            const finalUrl = await resolveUrl(rawUrl);
            add(fmt, finalUrl, mime);
          }
        }
      } else {
        log('OpenLibrary', `Gutendex returned ${gRes.status}, falling back to constructed URLs`);
      }
    } catch (e) {
      log('OpenLibrary', `Gutendex fetch failed, falling back to constructed URLs:`, e);
    }

    // Fallback / extra formats not in Gutendex
    if (!seen.has('EPUB')) {
      const epubUrl = await getGutenbergEpubUrl(gId);
      add('EPUB', epubUrl, 'application/epub+zip');
    }
    if (!seen.has('TXT')) {
      const txtUrl = `${GUTENBERG_BASE}/files/${gId}/${gId}-0.txt`;
      if (await tryHead(txtUrl)) add('TXT', txtUrl, 'text/plain');
    }
    if (!seen.has('HTML')) {
      const htmlUrl = `${GUTENBERG_API}/${gId}.html.images`;
      if (await tryHead(htmlUrl)) add('HTML', htmlUrl, 'text/html');
    }
    if (!seen.has('Kindle')) {
      const mobiUrl = `${GUTENBERG_API}/${gId}.kindle.noimages`;
      if (await tryHead(mobiUrl)) add('Kindle', mobiUrl, 'application/x-mobipocket-ebook');
    }
  }

  // 2. Internet Archive via OpenLibrary editions (ocaid) — only for public domain
  //    Skip when a Gutenberg ID exists — Gutendex already provides all formats.
  if (!gId && book.public_scan_b) {
    try {
      const editions = await getBookEditions(book.key);
      for (const ed of editions) {
        if (ed.ocaid) {
          log('OpenLibrary', `Found Internet Archive edition: ${ed.ocaid}`);
          const base = `https://archive.org/download/${ed.ocaid}/${ed.ocaid}`;
          const epubUrl = `${base}.epub`;
          const pdfUrl = `${base}.pdf`;
          if (!seen.has('EPUB') && await tryHead(epubUrl)) add('EPUB', epubUrl, 'application/epub+zip');
          if (!seen.has('PDF') && await tryHead(pdfUrl)) add('PDF', pdfUrl, 'application/pdf');
          if (!seen.has('TXT')) add('TXT', `${base}_djvu.txt`, 'text/plain');
          break;
        }
      }
    } catch {}
  }

  log('OpenLibrary', `Final download formats for "${book.title}":`, formats);
  return formats;
};

export async function fetchDescription(key: string) {
  try {
    const res = await fetch(`${BASE_URL}${key}.json`)
    if (!res.ok) {
      console.log(`[OpenLibrary] fetchDescription failed: ${res.status} for ${key}`)
      return null
    }
    const data = await res.json()
    if (data?.error) {
      console.log(`[OpenLibrary] fetchDescription error: ${data.error} for ${key}`)
      return null
    }
    return data?.description?.value ?? data?.description ?? null
  } catch (e) {
    console.log(`[OpenLibrary] fetchDescription error for ${key}:`, e)
    return null
  }
}
