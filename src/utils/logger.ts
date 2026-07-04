export const Logger = {
  source: (_source: string, _message: string) => {},
  api: (_method: string, _url: string, _options?: { limit?: number; offset?: number; query?: string }) => {},
  Books: {
    total: (_count: number) => {},
    breakdown: (_readable: number, _notReadable: number, _source: string) => {},
    filtered: (_from: number, _to: number, _filterType: string) => {},
    item: (_title: string, _isReadable: boolean) => {},
    match: (_title: string, _gutenbergId?: number) => {},
  },
  navigation: (_from: string, _to: string) => {},
  action: (_action: string, _details?: string) => {},
  data: (_label: string, _data: any) => {},
};
