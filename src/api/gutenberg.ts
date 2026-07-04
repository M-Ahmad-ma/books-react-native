// Book type imported but not used in this file

import { Book, SearchResponse } from "@/types";

const GUTENBERG_BASE = 'https://www.gutenberg.org';
const GUTENBERG_API = `${GUTENBERG_BASE}/ebooks`;
export const GUTENDEX_API = 'https://gutendex.com/books';

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  epubUrl: string;
  language: string;
  summary?: string;
  subjects?: string[];
  birth_year?: number;
  death_year?: number;
  firstPublishYear?: number;
}

const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

const normalizeAuthor = (author: string): string => {
  return author
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, '');
};

const COMMON_PUBLIC_DOMAIN_BOOKS: {
  title: string;
  author: string;
  gutenbergId: number;
  // summaries: string
}[] = [
    { title: 'Pride and Prejudice', author: 'Jane Austen', gutenbergId: 1342 },
    { title: 'Emma', author: 'Jane Austen', gutenbergId: 158 },
    { title: 'Sense and Sensibility', author: 'Jane Austen', gutenbergId: 161 },
    { title: 'Mansfield Park', author: 'Jane Austen', gutenbergId: 141 },
    { title: 'Moby-Dick', author: 'Herman Melville', gutenbergId: 15 },
    { title: 'Billy Budd', author: 'Herman Melville', gutenbergId: 42072 },
    { title: 'Jane Eyre', author: 'Charlotte Bronte', gutenbergId: 1260 },
    { title: 'Wuthering Heights', author: 'Emily Bronte', gutenbergId: 768 },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      gutenbergId: 6432,
    },
    { title: 'Frankenstein', author: 'Mary Shelley', gutenbergId: 84 },
    { title: 'Dracula', author: 'Bram Stoker', gutenbergId: 345 },
    {
      title: 'The Adventures of Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      gutenbergId: 1661,
    },
    {
      title: 'A Study in Scarlet',
      author: 'Arthur Conan Doyle',
      gutenbergId: 244,
    },
    {
      title: 'The Hound of the Baskervilles',
      author: 'Arthur Conan Doyle',
      gutenbergId: 2852,
    },
    { title: 'A Tale of Two Cities', author: 'Charles Dickens', gutenbergId: 98 },
    { title: 'Great Expectations', author: 'Charles Dickens', gutenbergId: 1400 },
    { title: 'Oliver Twist', author: 'Charles Dickens', gutenbergId: 130 },
    { title: 'David Copperfield', author: 'Charles Dickens', gutenbergId: 196 },
    { title: 'Bleak House', author: 'Charles Dickens', gutenbergId: 1023 },
    { title: 'Hard Times', author: 'Charles Dickens', gutenbergId: 2252 },
    { title: 'A Christmas Carol', author: 'Charles Dickens', gutenbergId: 46 },
    { title: 'War and Peace', author: 'Leo Tolstoy', gutenbergId: 2600 },
    { title: 'Anna Karenina', author: 'Leo Tolstoy', gutenbergId: 1399 },
    {
      title: 'The Death of Ivan Ilyich',
      author: 'Leo Tolstoy',
      gutenbergId: 6918,
    },
    { title: 'The Iliad', author: 'Homer', gutenbergId: 1727 },
    { title: 'The Odyssey', author: 'Homer', gutenbergId: 1727 },
    { title: 'Don Quixote', author: 'Miguel de Cervantes', gutenbergId: 996 },
    {
      title: 'The Count of Monte Cristo',
      author: 'Alexandre Dumas',
      gutenbergId: 1184,
    },
    {
      title: 'The Three Musketeers',
      author: 'Alexandre Dumas',
      gutenbergId: 135,
    },
    { title: 'Twenty Years After', author: 'Alexandre Dumas', gutenbergId: 2591 },
    { title: 'Les Miserables', author: 'Victor Hugo', gutenbergId: 135 },
    {
      title: 'The Hunchback of Notre Dame',
      author: 'Victor Hugo',
      gutenbergId: 17589,
    },
    {
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      gutenbergId: 174,
    },
    {
      title: 'The Importance of Being Earnest',
      author: 'Oscar Wilde',
      gutenbergId: 844,
    },
    {
      title: 'The Secret Garden',
      author: 'Frances Hodgson Burnett',
      gutenbergId: 113,
    },
    { title: 'Little Women', author: 'Louisa May Alcott', gutenbergId: 37134 },
    { title: 'Little Men', author: 'Louisa May Alcott', gutenbergId: 10514 },
    {
      title: 'Anne of Green Gables',
      author: 'Lucy Maud Montgomery',
      gutenbergId: 2852,
    },
    {
      title: 'Anne of Avonlea',
      author: 'Lucy Maud Montgomery',
      gutenbergId: 2853,
    },
    {
      title: 'Treasure Island',
      author: 'Robert Louis Stevenson',
      gutenbergId: 46,
    },
    { title: 'Kidnapped', author: 'Robert Louis Stevenson', gutenbergId: 67968 },
    {
      title: 'Strange Case of Dr Jekyll and Mr Hyde',
      author: 'Robert Louis Stevenson',
      gutenbergId: 43,
    },
    { title: 'Black Beauty', author: 'Anna Sewell', gutenbergId: 113 },
    {
      title: 'The Adventures of Tom Sawyer',
      author: 'Mark Twain',
      gutenbergId: 74,
    },
    {
      title: 'Adventures of Huckleberry Finn',
      author: 'Mark Twain',
      gutenbergId: 76,
    },
    {
      title: 'The Prince and the Pauper',
      author: 'Mark Twain',
      gutenbergId: 2939,
    },
    {
      title: 'A Connecticut Yankee in King Arthurs Court',
      author: 'Mark Twain',
      gutenbergId: 86,
    },
    { title: 'The Call of the Wild', author: 'Jack London', gutenbergId: 215 },
    { title: 'White Fang', author: 'Jack London', gutenbergId: 216 },
    { title: 'The Sea Wolf', author: 'Jack London', gutenbergId: 1904 },
    { title: 'The Jungle Book', author: 'Rudyard Kipling', gutenbergId: 236 },
    {
      title: 'The Second Jungle Book',
      author: 'Rudyard Kipling',
      gutenbergId: 237,
    },
    { title: 'Kim', author: 'Rudyard Kipling', gutenbergId: 2096 },
    { title: 'Just So Stories', author: 'Rudyard Kipling', gutenbergId: 18928 },
    { title: 'Alice in Wonderland', author: 'Lewis Carroll', gutenbergId: 11 },
    {
      title: 'Through the Looking-Glass',
      author: 'Lewis Carroll',
      gutenbergId: 12,
    },
    { title: 'Silas Marner', author: 'George Eliot', gutenbergId: 236 },
    { title: 'Middlemarch', author: 'George Eliot', gutenbergId: 1459 },
    { title: 'The Mill on the Floss', author: 'George Eliot', gutenbergId: 8442 },
    { title: 'Peter Pan', author: 'James Barrie', gutenbergId: 216 },
    { title: 'Pinocchio', author: 'Carlo Collodi', gutenbergId: 500 },
  ];

const normalizeGutenbergBookTitle = (title: string): string => {
  return normalizeTitle(title).replace(/\s+/g, ' ');
};

const findBestMatch = (
  queryTitle: string,
  queryAuthor?: string,
): (typeof COMMON_PUBLIC_DOMAIN_BOOKS)[number] | null => {
  const normalizedQueryTitle = normalizeGutenbergBookTitle(queryTitle);
  const normalizedQueryAuthor = queryAuthor
    ? normalizeAuthor(queryAuthor)
    : null;

  let bestMatch: (typeof COMMON_PUBLIC_DOMAIN_BOOKS)[number] | null = null;
  let bestScore = 0;

  for (const book of COMMON_PUBLIC_DOMAIN_BOOKS) {
    const normalizedBookTitle = normalizeGutenbergBookTitle(book.title);
    const normalizedBookAuthor = normalizeAuthor(book.author);

    const exactTitleMatch = normalizedQueryTitle === normalizedBookTitle;

    let score = 0;
    if (exactTitleMatch) {
      score = 100;
      if (normalizedQueryAuthor) {
        if (normalizedQueryAuthor === normalizedBookAuthor) {
          score = 200;
        } else if (
          normalizedBookAuthor.includes(normalizedQueryAuthor) ||
          normalizedQueryAuthor.includes(normalizedBookAuthor)
        ) {
          score = 150;
        }
      }
    } else if (
      normalizedQueryTitle.includes(normalizedBookTitle) ||
      normalizedBookTitle.includes(normalizedQueryTitle)
    ) {
      score = 50;
      if (
        normalizedQueryAuthor &&
        normalizedBookAuthor.includes(normalizedQueryAuthor)
      ) {
        score = 75;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = book;
    }
  }

  return bestScore >= 50 ? bestMatch : null;
};

const getEpubUrls = (gutenbergId: number): string[] => {
  const formats = [
    `${GUTENBERG_API}/${gutenbergId}.epub3.images`,
    `${GUTENBERG_API}/${gutenbergId}.epub.images`,
    `${GUTENBERG_API}/${gutenbergId}.epub.noimages`,
    `${GUTENBERG_API}/${gutenbergId}.epub`,
  ];
  return formats;
};

export const getGutenbergEpubUrl = async (
  gutenbergId: number,
): Promise<string> => {
  const urls = getEpubUrls(gutenbergId);


  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok || response.status === 405) {
        return url;
      }
    } catch {
      continue;
    }
  }

  return `${GUTENBERG_API}/${gutenbergId}.epub`;
};

export const getGutenbergCoverUrl = (gutenbergId: number): string => {
  const url = `${GUTENBERG_BASE}/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`;
  return url;
};

export const findGutenbergBook = async (
  title: string,
  author?: string,
): Promise<GutenbergBook | null> => {

  const match = findBestMatch(title, author);

  if (!match) {
    return null;
  }

  const epubUrl = await getGutenbergEpubUrl(match.gutenbergId);

  let summary: string | undefined;
  let subjects: string[] | undefined;
  let firstPublishYear: number | undefined;

  try {
    const gutendexUrl = `${GUTENDEX_API}/${match.gutenbergId}`;
    const gutendexResponse = await fetch(gutendexUrl);

    if (gutendexResponse.ok) {
      const metadata = await gutendexResponse.json();

      if (metadata.summaries?.length > 0) {
        summary = metadata.summaries[0];
      }
      if (metadata.subjects?.length > 0) {
        subjects = metadata.subjects.slice(0, 10);
      }
      const author0 = metadata.authors?.[0] as { name: string; birth_year?: number; death_year?: number } | undefined;
      if (author0?.birth_year && author0.death_year) {
        firstPublishYear = Math.floor((author0.birth_year + author0.death_year) / 2);
      }
    } else {
    }
  } catch (err) {
  }

  return {
    id: match.gutenbergId,
    title: match.title,
    author: match.author,
    coverUrl: getGutenbergCoverUrl(match.gutenbergId),
    epubUrl,
    language: 'en',
    summary,
    subjects,
    firstPublishYear,
  };
};

export const getPublicDomainBooks = (): GutenbergBook[] => {
  return COMMON_PUBLIC_DOMAIN_BOOKS.map(book => ({
    id: book.gutenbergId,
    title: book.title,
    author: book.author,
    coverUrl: getGutenbergCoverUrl(book.gutenbergId),
    epubUrl: `${GUTENBERG_API}/${book.gutenbergId}.epub`,
    language: 'en',
  }));
};

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    title: string;
    authors: { name: string }[];
    subjects: string[];
    languages: string[];
    summaries: string[];
    formats: Record<string, string>;
    download_count: number;
  }[];
}

/**
 * Fetches public domain books from Project Gutenberg via Gutendex API.
 *
 * Fix: Now correctly maps front‑end filter values (e.g. "science_fiction")
 * to Gutendex topic names (e.g. "science-fiction") and uses the `topic`
 * query parameter instead of the invalid `subjects`.
 */
export const getGutenbergPublicDomainBooks = async (
  limit = 20,
  page = 1,
  subject?: string,
): Promise<{ books: GutenbergBook[]; next: string | null; count: number }> => {
  try {
    // Map front‑end filter keys to Gutendex topic slugs
    const topicMap: Record<string, string> = {
      fiction: 'fiction',
      drama: 'drama',
      humor: 'humor',
      science_fiction: 'science-fiction',
      mystery: 'mystery',
      adventure: 'adventure',
      romance: 'romance',
      fantasy: 'fantasy',
      historical_fiction: 'historical-fiction',
      horror: 'horror',
      poetry: 'poetry',
      philosophy: 'philosophy',
      psychology: 'psychology',
      science: 'science',
      history: 'history',
    };

    // Determine the correct topic parameter
    const topic =
      subject && subject !== 'all' ? topicMap[subject] || subject : undefined;
    const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : '';

    const url = `${GUTENDEX_API}/?languages=en&page=${page}&per_page=${limit}${topicParam}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GutendexResponse = await response.json();

    const books: GutenbergBook[] = (data.results || []).map(book => {
      const epubUrl = book.formats['application/epub+zip'] || '';
      const apiCoverUrl = book.formats['image/jpeg'] || '';
      const coverUrl = apiCoverUrl || getGutenbergCoverUrl(book.id);

      const summary = book.summaries?.[0] || undefined;
      const subjects = book.subjects?.length ? book.subjects : undefined;
      const author = book.authors?.[0];
      const authorWithYears = author as { name: string; birth_year?: number; death_year?: number } | undefined;
      const firstPublishYear = authorWithYears?.birth_year && authorWithYears?.death_year
        ? Math.floor((authorWithYears.birth_year + authorWithYears.death_year) / 2)
        : undefined;

      return {
        id: book.id,
        title: book.title,
        author: author?.name || 'Unknown Author',
        coverUrl,
        epubUrl,
        language: book.languages?.[0] || 'en',
        summary,
        subjects,
        firstPublishYear,
      };
    });

    return { books, next: data.next, count: data.count };
  } catch (error) {
    throw error;
  }
};


/**
 * Searches Gutendex for public-domain books matching a query.
 * Accepts the same (query, limit, offset, subject) signature as
 * OpenLibrary's searchBooks so both can be used interchangeably
 * in an infinite query hook.
 */
export const searchGutenbergBooks = async (
  query: string,
  limit = 20,
  offset = 0,
  subject?: string,
): Promise<SearchResponse> => {
  const page = Math.floor(offset / limit) + 1;

  const topicMap: Record<string, string> = {
    fiction: 'fiction',
    drama: 'drama',
    humor: 'humor',
    science_fiction: 'science-fiction',
    mystery: 'mystery',
    adventure: 'adventure',
    romance: 'romance',
    fantasy: 'fantasy',
    historical_fiction: 'historical-fiction',
    horror: 'horror',
    poetry: 'poetry',
    philosophy: 'philosophy',
    psychology: 'psychology',
    science: 'science',
    history: 'history',
  };

  const topic =
    subject && subject !== 'all' ? topicMap[subject] || subject : undefined;
  const topicParam = topic ? `&topic=${encodeURIComponent(topic)}` : '';

  const encodedQuery = encodeURIComponent(query);
  const url = `${GUTENDEX_API}/?search=${encodedQuery}&languages=en&page=${page}&per_page=${limit}${topicParam}`;


  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GutendexResponse = await response.json();

    const docs: Book[] = (data.results || []).map(book => {
      const apiCoverUrl = book.formats['image/jpeg'] || '';
      const coverUrl = apiCoverUrl || getGutenbergCoverUrl(book.id);
      const author = book.authors?.[0];
      const authorWithYears = author as { name: string; birth_year?: number; death_year?: number } | undefined;
      const firstPublishYear = authorWithYears?.birth_year && authorWithYears?.death_year
        ? Math.floor((authorWithYears.birth_year + authorWithYears.death_year) / 2)
        : undefined;

      return {
        key: `/works/OL${book.id}W`,
        title: book.title,
        author_name: [author?.name || 'Unknown Author'],
        coverUrl,
        public_scan_b: true,
        has_fulltext: true,
        ebook_access: 'borrowable',
        first_publish_year: firstPublishYear,
      } as Book;
    });

    return { numFound: data.count, start: 0, docs };
  } catch (error) {
    throw error;
  }
};

export const getGutenbergBookDetails = async (workId: string): Promise<Book> => {
  try {
    const url = `${GUTENBERG_BASE}/works/${workId}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

