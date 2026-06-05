export const Logger = {
  source: (source: string, message: string) => {
    console.log(`[${source}] ${message}`);
  },

  api: (
    method: string,
    url: string,
    options?: { limit?: number; offset?: number; query?: string },
  ) => {
    const opts = options
      ? ` (limit: ${options.limit}, offset: ${options.offset})`
      : '';
    console.log(`[API] ${method}: ${url}${opts}`);
  },

  Books: {
    total: (count: number) => {
      console.log(`[Books] Total received: ${count}`);
    },

    breakdown: (readable: number, notReadable: number, source: string) => {
      const total = readable + notReadable;
      console.log(
        `[Books] ${source} - Total: ${total} | Readable (Public Domain): ${readable} | Not Readable (Premium): ${notReadable}`,
      );
    },

    filtered: (from: number, to: number, filterType: string) => {
      console.log(`[Books] Filtered: ${from} → ${to} (${filterType})`);
    },

    item: (title: string, isReadable: boolean) => {
      console.log(
        `[Books] ${title}: ${isReadable ? '✅ READABLE' : '🔒 PREMIUM'}`,
      );
    },

    match: (title: string, gutenbergId?: number) => {
      if (gutenbergId) {
        console.log(`[Gutenberg] MATCH: "${title}" → ID: ${gutenbergId}`);
      } else {
        console.log(`[Gutenberg] NO MATCH: "${title}"`);
      }
    },
  },

  navigation: (from: string, to: string) => {
    console.log(`[Nav] ${from} → ${to}`);
  },

  action: (action: string, details?: string) => {
    console.log(`[Action] ${action}${details ? `: ${details}` : ''}`);
  },

  data: (label: string, data: any) => {
    console.log(
      `[Data] ${label}:`,
      JSON.stringify(data, null, 2).substring(0, 500),
    );
  },
};
