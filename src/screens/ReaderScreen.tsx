import React, { useEffect, useState, useRef, useCallback, useMemo, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Settings, X } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getCachePath, isCached, downloadToCache } from '../utils/readerCache';
import { useReading } from '../context/ReadingContext';
import { useDownloads } from '../context/DownloadsContext';
import { useReaderPreferences } from '../context/ReaderPreferencesContext';
import { ReaderSettingsSheet } from '../components/ReaderSettingsSheet';
import { SkeletonReaderHeader, SkeletonReaderContent } from '../components/Skeleton';

let WebView: any = null;
let WebViewFallback: any = null;

if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
} else {
  WebViewFallback = React.forwardRef(({ source, style, onLoad, onLoadEnd, onLoadStart, onError, onMessage: parentOnMessage, initialProgress = 0, ...props }: any, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loaded, setLoaded] = useState(false);
    const blobUrlRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      postMessage: (data: unknown) => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(data, '*');
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setLoaded(false);
      onLoadStart?.();

      const CORS_PROXIES = [
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        (url: string) => `https://corsproxy.org/?${encodeURIComponent(url)}`,
      ];

      const fetchWithTimeout = (url: string, ms = 15000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id));
      };

      const tryProxies = (url: string): Promise<string> => {
        const timeout = 8000;
        return new Promise((resolve, reject) => {
          let rejected = 0;
          const total = CORS_PROXIES.length;
          for (const proxy of CORS_PROXIES) {
            fetchWithTimeout(proxy(url), timeout)
              .then(async r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return await r.text();
              })
              .then(resolve)
              .catch(() => {
                rejected++;
                if (rejected === total) reject(new Error('All proxies failed'));
              });
          }
        });
      };

      const textToHtml = (text: string): string => {
        const lines = text.split('\n');
        const startIdx = lines.findIndex(l => l.includes('*** START OF THE PROJECT GUTENBERG'));
        const endIdx = lines.findIndex(l => l.includes('*** END OF THE PROJECT GUTENBERG'));
        const body = startIdx >= 0 && endIdx > startIdx
          ? lines.slice(startIdx + 1, endIdx).join('\n')
          : text;
        return '<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head><body>' +
          body.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>') +
          '</body></html>';
      };

      const getGutenbergTextUrl = (url: string): string | null => {
        const match = url.match(/\/(\d+)\//);
        if (!match) return null;
        return `https://www.gutenberg.org/cache/epub/${match[1]}/pg${match[1]}.txt`;
      };

      const getGutenbergIdFromUri = (uri: string): string | null => {
        const match = uri.match(/\/(\d+)\//);
        return match ? match[1] : null;
      };

      const loadContent = async () => {
        let html = source?.html || null;

        if (!html && source?.uri) {
          const cacheId = getGutenbergIdFromUri(source.uri);
          if (cacheId && webContentCache.has(cacheId)) {
            html = webContentCache.get(cacheId)!;
          }
        }

        if (!html && source?.uri) {
          const textUrl = getGutenbergTextUrl(source.uri);
          if (textUrl) {
            try {
              const text = await tryProxies(textUrl);
              if (!cancelled) html = textToHtml(text);
            } catch { }
          }
          if (!html && !cancelled) {
            try {
              html = await tryProxies(source.uri);
            } catch { }
          }
          if (!html && !cancelled) {
            if (iframeRef.current) {
              iframeRef.current.src = source.uri;
            }
            onError?.({ description: 'Book page loaded directly — custom styling unavailable.' });
            return;
          }
        }

        if (!html || cancelled) return;

        const cacheKey = source?.uri ? getGutenbergIdFromUri(source.uri) : null;
        if (cacheKey && !webContentCache.has(cacheKey) && !source?.html) {
          webContentCache.set(cacheKey, html);
        }

        if (html) {
          const scrollScript = `
            <script>
              (function() {
                var initialProgress = ${initialProgress};

                if (initialProgress > 0) {
                  var doRestore = function() {
                    var sh = document.documentElement.scrollHeight - window.innerHeight;
                    window.scrollTo(0, (initialProgress / 100) * sh);
                  };
                  if (document.readyState === 'complete') doRestore();
                  else window.addEventListener('load', doRestore);
                }

                var lastProgress = 0;
                function sendProgress() {
                  var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                  var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                  var progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
                  if (progress !== lastProgress && progress >= 0 && progress <= 100) {
                    lastProgress = progress;
                    window.parent.postMessage(JSON.stringify({ type: 'progress-update', progress: progress }), '*');
                  }
                }
                window.addEventListener('scroll', sendProgress, { passive: true });
                window.addEventListener('load', sendProgress);
                setTimeout(sendProgress, 500);

                window.addEventListener('message', function(event) {
                  if (event.data && event.data.type === 'apply-styles') {
                    var style = document.getElementById('reader-custom-styles');
                    if (!style) {
                      style = document.createElement('style');
                      style.id = 'reader-custom-styles';
                      document.head.appendChild(style);
                    }
                    style.textContent = event.data.css;
                    window.parent.postMessage(JSON.stringify({ type: 'styles-applied' }), '*');
                  }
                  if (event.data && event.data.type === 'scroll-restore') {
                    var pct = event.data.progress;
                    setTimeout(function() {
                      var sh = document.documentElement.scrollHeight - window.innerHeight;
                      window.scrollTo(0, (pct / 100) * sh);
                    }, 300);
                  }
                });
              })();
            </script>
          `;

          const bg = style.backgroundColor || '#FFFFFF';
          const isDarkBg = (bg: string) => {
            const hex = bg.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return r * 0.299 + g * 0.587 + b * 0.114 < 128;
          };
          const fg = isDarkBg(bg) ? '#E6E1E5' : '#1C1B1F';

          html = html.replace('</head>', '<style>' +
            'body{background-color:' + bg + '!important;color:' + fg + '!important;font-size:18px!important;line-height:1.8!important;max-width:720px!important;margin:0 auto!important;padding:16px 24px!important;}' +
            'p{text-align:justify!important;margin-bottom:16px!important;}' +
            'h1,h2,h3{color:' + fg + '!important;margin:24px 0 16px!important;}' +
            'a{color:#6750A4!important;}' +
            'img{max-width:100%!important;height:auto!important;}' +
            'blockquote{border-left:3px solid #6750A4!important;padding-left:16px!important;margin:16px 0!important;font-style:italic!important;}' +
            '.pg-header,.nav,header,nav,.navigation,.header,.footer-nav,#nav-bar,.patron-header{display:none!important;}' +
            '</style>' + scrollScript + '</head>');

          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          if (iframeRef.current) {
            iframeRef.current.src = url;
          }
        }
      };

      loadContent();

      return () => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
      };
    }, [source?.html, source?.uri]);

    useEffect(() => {
      const handleMessageEvent = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'progress-update' || data.type === 'styles-applied') {
            parentOnMessage?.({ nativeEvent: { data: event.data } });
          }
        } catch { }
      };
      window.addEventListener('message', handleMessageEvent);
      return () => window.removeEventListener('message', handleMessageEvent);
    }, [parentOnMessage]);

    useEffect(() => {
      if (!loaded || !iframeRef.current) return;
      const handler = (e: MessageEvent) => {
        if (e.data?.type === 'scroll-restore') {
          const pct = e.data.progress;
          setTimeout(() => {
            const sh = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, (pct / 100) * sh);
          }, 500);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [loaded]);

    const handleLoad = () => {
      if (!loaded) {
        setLoaded(true);
        onLoad?.();
        // FIX: Do not call onLoadEnd here – wait for styles-applied
      }
    };

    return (
      <iframe
        ref={iframeRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: style?.backgroundColor || '#FFFFFF',
        }}
        onLoad={handleLoad}
        sandbox="allow-scripts"
        title="Book Reader"
      />
    );
  });
}

const webContentCache = new Map<string, string>();

const log = (tag: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (data) {
  } else {
  }
};

const getGutenbergId = (epubUrl: string): string | null => {
  const match = epubUrl.match(/\/(\d+)\./);
  return match ? match[1] : null;
};

const getHtmlUrl = (gutenbergId: string): string => {
  return `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`;
};

const getFallbackUrl = (gutenbergId: string): string => {
  return `https://www.gutenberg.org/ebooks/${gutenbergId}.html`;
};

export const ReaderScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; localFile?: string; format?: string }>();
  const insets = useSafeAreaInsets();
  const { getReadingBook, updateProgress } = useReading();
  const { downloadedBooks, updateDownloadProgress } = useDownloads();
  const { preferences, getThemeColors, getFontFamily, isLoaded } = useReaderPreferences();

  const webViewRef = useRef<any>(null);
  const webFallbackRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [webViewReady, setWebViewReady] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [contentRendered, setContentRendered] = useState(false);

  const progressRef = useRef(currentProgress);
  const rawFileContentRef = useRef<string | null>(null);
  useEffect(() => {
    progressRef.current = currentProgress;
  }, [currentProgress]);

  const bookId = params.id;
  const localFile = params.localFile;
  const format = params.format;
  const [localHtmlContent, setLocalHtmlContent] = useState<string | null>(null);
  const book = getReadingBook(bookId || '');
  const dlBook = useMemo(() => downloadedBooks.find(b => b.id === bookId), [downloadedBooks, bookId]);
  const savedProgress = book?.progress ?? dlBook?.progress ?? 0;
  console.log('[Reader] Render - savedProgress:', savedProgress, '| book?.progress:', book?.progress, '| dlBook?.progress:', dlBook?.progress, '| localFile:', localFile, '| webViewReady:', webViewReady);
  const [cachedFileUri, setCachedFileUri] = useState<string | null>(null);
  const [cacheChecked, setCacheChecked] = useState(false);
  const gutenbergId = useMemo(() => localFile ? null : (book?.epubUrl ? getGutenbergId(book.epubUrl) : null), [book?.epubUrl, localFile]);

  const themeColors = useMemo(() => getThemeColors(), [preferences.theme]);
  const fontFamily = useMemo(() => getFontFamily(), [preferences.font]);

  // FIX: Only hide loading when contentRendered is true AND a minimum time has passed
  useEffect(() => {
    if (contentRendered) {
      setLoadTimedOut(false);
      // Ensure loading stays for at least 300ms after content rendered
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [contentRendered]);

  // FIX: Also show loading overlay when loading is true (with minimum display)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setShowLoading(true);
    } else if (showLoading) {
      timer = setTimeout(() => setShowLoading(false), 300);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setLoadTimedOut(false);
    const timer = setTimeout(() => {
      if (loading) {
        setLoadTimedOut(true);
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [webViewKey, loading]);

  useEffect(() => {
    if (!webViewReady) return;
    const pct = progressRef.current;
    console.log('[Reader] Preferences changed - re-injecting styles | localFile:', localFile, '| progressRef:', pct, '| theme:', preferences.theme, '| font:', preferences.font, '| fontSize:', preferences.fontSize);
    if (Platform.OS !== 'web' && webViewRef.current) {
      const injectStyles = generateInjectStyles();
      webViewRef.current.injectJavaScript(injectStyles);
      webViewRef.current.injectJavaScript(getScrollTrackingScript());
      if (pct > 0) {
        setTimeout(() => {
          try {
            webViewRef.current?.injectJavaScript(getScrollRestoreScript(progressRef.current));
          } catch (e) {}
        }, 300);
      }
    }
    if (Platform.OS === 'web' && webFallbackRef.current) {
      const css = getReaderCss();
      webFallbackRef.current.postMessage({ type: 'apply-styles', css });
      if (pct > 0) {
        setTimeout(() => {
          try {
            webFallbackRef.current?.postMessage({ type: 'scroll-restore', progress: progressRef.current });
          } catch (e) {}
        }, 600);
      }
    }
  }, [webViewReady, preferences.theme, preferences.font, preferences.fontSize, preferences.lineHeight]);

  // Reactive scroll restoration: fires ONCE when savedProgress becomes available after webViewReady
  // Uses a ref to capture the progress at the moment of first readiness — ignores later scroll updates
  const restoreLaunchedRef = useRef(false);

  useEffect(() => {
    if (!webViewReady) {
      restoreLaunchedRef.current = false;
      return;
    }
    if (restoreLaunchedRef.current) return;
    if (savedProgress <= 0) return;

    restoreLaunchedRef.current = true;
    const targetProgress = savedProgress; // snapshot at first ready — not affected by later scrolls
    console.log('[Reader] Reactive restore - firing once with progress:', targetProgress);

    const retryDelays = [400, 800, 1400, 2200];
    retryDelays.forEach(delay => {
      setTimeout(() => {
        try {
          if (Platform.OS !== 'web' && webViewRef.current) {
            webViewRef.current.injectJavaScript(getScrollRestoreScript(targetProgress));
          }
          if (Platform.OS === 'web' && webFallbackRef.current) {
            webFallbackRef.current.postMessage({ type: 'scroll-restore', progress: targetProgress });
          }
        } catch (e) {}
      }, delay);
    });
  }, [webViewReady, savedProgress]);

  const getReaderCss = useCallback(() => {
    return [
      'body {',
      '  background-color: ' + themeColors.background + ' !important;',
      '  color: ' + themeColors.text + ' !important;',
      '  font-family: ' + fontFamily + ' !important;',
      '  font-size: ' + preferences.fontSize + 'px !important;',
      '  line-height: ' + preferences.lineHeight + ' !important;',
      '  max-width: 720px !important;',
      '  margin: 0 auto !important;',
      '  padding: 16px 24px !important;',
      '}',
      'p { margin-bottom: 16px !important; text-align: justify !important; }',
      'h1, h2, h3, h4, h5, h6 { color: ' + themeColors.text + ' !important; margin: 24px 0 16px !important; }',
      'a { color: #6750A4 !important; }',
      '.pg-header, .nav, header, nav, .navigation, .header, .footer-nav, #nav-bar, .patron-header { display: none !important; }',
      'img { max-width: 100% !important; height: auto !important; }',
      'blockquote { border-left: 3px solid #6750A4 !important; padding-left: 16px !important; margin: 16px 0 !important; font-style: italic !important; }',
    ].join('\n');
  }, [themeColors, fontFamily, preferences]);

  const generateInjectStyles = useCallback(() => {
    const css = getReaderCss();
    return `
      (function() {
        if (!document.getElementById('reader-custom-styles')) {
          var style = document.createElement('style');
          style.id = 'reader-custom-styles';
          document.head.appendChild(style);
        }
        var style = document.getElementById('reader-custom-styles');
        style.textContent = \`${css}\`;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'styles-applied' }));
      })();
      true;
    `;
  }, [getReaderCss]);

  const handleWebViewError = (err: any) => {
    setError(err.description || 'Failed to load book');
    setLoading(false);
    setContentRendered(true); // force hide loading
  };

  const handleWebViewLoadStart = () => {
    if (contentRendered) return;
    setLoading(true);
    setContentRendered(false);
    setError(null);
  };

  const handleWebViewLoadEnd = () => {
    // FIX: Do not set loading false here – wait for styles-applied
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'styles-applied') {
        setContentRendered(true);
      } else if (data.type === 'progress-update') {
        const progress = Math.min(100, Math.max(0, Math.round(data.progress)));
        console.log('[Reader] progress-update:', progress, '| book:', !!book, '| dlBook:', !!dlBook);
        setCurrentProgress(progress);
        if (progress > 0) {
          if (book) updateProgress(book.id, progress);
          if (dlBook) updateDownloadProgress(bookId || '', progress);
        }
      }
    } catch (e) {
      console.warn('[Reader] handleMessage error:', e);
    }
  };

  const handleWebViewLoad = () => {
    console.log('[Reader] handleWebViewLoad - savedProgress:', savedProgress, '| webViewReady before:', webViewReady, '| localFile:', localFile);
    setWebViewReady(true);
    setCurrentProgress(savedProgress);
    if (Platform.OS !== 'web' && webViewRef.current) {
      try {
        webViewRef.current.injectJavaScript(generateInjectStyles());
        webViewRef.current.injectJavaScript(getScrollTrackingScript());
      } catch (e) {
      }
      if (savedProgress > 0) {
        setTimeout(() => {
          try {
            console.log('[Reader] Attempting scroll restore to:', savedProgress);
            webViewRef.current.injectJavaScript(getScrollRestoreScript(savedProgress));
          } catch (e) {
          }
        }, 600);
      } else {
        console.log('[Reader] Skipping scroll restore - savedProgress is 0 at load');
      }
    }
    if (Platform.OS === 'web' && webFallbackRef.current) {
      try {
        const css = getReaderCss();
        webFallbackRef.current.postMessage({ type: 'apply-styles', css });
      } catch (e) {
      }
      if (savedProgress > 0) {
        setTimeout(() => {
          try {
            webFallbackRef.current.postMessage({ type: 'scroll-restore', progress: savedProgress });
          } catch (e) {
          }
        }, 800);
      } else {
        console.log('[Reader] Web fallback - skipping scroll restore, savedProgress:', savedProgress);
      }
    }
  };

  const getScrollRestoreScript = (progress: number) => {
    return `
      (function() {
        var sh = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, (${progress} / 100) * sh);
      })();
      true;
    `;
  };

  const getScrollTrackingScript = () => {
    return `
      (function() {
        let lastProgress = 0;
        const sendProgress = () => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
          if (progress !== lastProgress && progress >= 0 && progress <= 100) {
            lastProgress = progress;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'progress-update', progress: progress }));
          }
        };
        
        window.addEventListener('scroll', sendProgress, { passive: true });
        window.addEventListener('load', sendProgress);
        
        setTimeout(sendProgress, 500);
      })();
      true;
    `;
  };

  const handleGoBack = () => {
    if (Platform.OS !== 'web' && webViewRef.current?.canGoBack) {
      webViewRef.current.goBack();
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (!localFile) return;
    const isTxt = format === 'TXT';
    const isHtml = format === 'HTML';
    if (!isTxt && !isHtml) return;

    const scrollTrackingScript = `
      <script>
      (function() {
        var lastProgress = 0;
        function sendProgress() {
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
          if (progress !== lastProgress && progress >= 0 && progress <= 100) {
            lastProgress = progress;
            try {
              var msg = JSON.stringify({ type: 'progress-update', progress: progress });
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(msg);
              } else if (window.parent) {
                window.parent.postMessage(msg, '*');
              }
            } catch(e) {}
          }
        }
        window.addEventListener('scroll', sendProgress, { passive: true });
        window.addEventListener('load', sendProgress);
        setTimeout(sendProgress, 500);
      })();
      </script>
    `;

    const generateHtml = (raw: string) => {
      const css = getReaderCss();
      if (isTxt) {
        return `<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><style>${css}body{white-space:pre-wrap;word-wrap:break-word;}</style>${scrollTrackingScript}</head><body>${raw.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`;
      }
      return raw.replace('</head>', `<style>${css}</style>${scrollTrackingScript}</head>`);
    };

    const loadFile = async () => {
      let raw = rawFileContentRef.current;
      const isFromCache = !!raw;
      if (!raw) {
        try {
          raw = await FileSystem.readAsStringAsync(localFile, { encoding: FileSystem.EncodingType.UTF8 });
          rawFileContentRef.current = raw;
        } catch {
          return;
        }
      }
      console.log('[Reader] Local file HTML regenerated | fromCache:', isFromCache, '| format:', format, '| theme:', preferences.theme, '| font:', preferences.font, '| fontSize:', preferences.fontSize);
      setLocalHtmlContent(generateHtml(raw));
    };

    loadFile();
  }, [localFile, format, themeColors, fontFamily, preferences]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setCacheChecked(true);
      return;
    }
    if (!gutenbergId || localFile || localHtmlContent) {
      setCachedFileUri(null);
      setCacheChecked(true);
      return;
    }
    setCacheChecked(false);
    isCached(gutenbergId).then(found => {
      if (found) {
        setCachedFileUri(getCachePath(gutenbergId));
      } else {
        setCachedFileUri(null);
      }
      setCacheChecked(true);
    });
  }, [gutenbergId, localFile, localHtmlContent, webViewKey]);

  useEffect(() => {
    if (Platform.OS === 'web' || !contentRendered || !gutenbergId || cachedFileUri) return;
    const remoteUrl = getHtmlUrl(gutenbergId);
    downloadToCache(remoteUrl, gutenbergId)
      .then(localUri => {
        setCachedFileUri(localUri);
      })
      .catch(err => {});
  }, [contentRendered]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-md-surface-light dark:bg-md-surface-dark">
        <SkeletonReaderHeader />
        <SkeletonReaderContent />
      </SafeAreaView>
    );
  }

  if (!book && !localFile) {
    return (
      <SafeAreaView className="flex-1 bg-md-surface-light dark:bg-md-surface-dark items-center justify-center">
        <Text className="text-md-title-large text-md-onSurface-light dark:text-md-onSurface-dark">Book not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
        >
          <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (gutenbergId && !cacheChecked && !localFile && !localHtmlContent) {
    return (
      <SafeAreaView className="flex-1 bg-md-surface-light dark:bg-md-surface-dark">
        <SkeletonReaderHeader />
        <SkeletonReaderContent />
      </SafeAreaView>
    );
  }

  let source;
  if (localHtmlContent) {
    source = { html: localHtmlContent, baseUrl: 'file:///' };
  } else if (gutenbergId && cachedFileUri) {
    source = { uri: cachedFileUri };
  } else if (book?.epubUrl) {
    const id = gutenbergId || getGutenbergId(book.epubUrl);
    const htmlUrl = id ? getHtmlUrl(id) : getFallbackUrl(id || '');
    source = { uri: htmlUrl };
  }

  if (!source && localFile && !localHtmlContent) {
    return (
      <SafeAreaView className="flex-1 bg-md-surface-light dark:bg-md-surface-dark">
        <SkeletonReaderHeader />
        <SkeletonReaderContent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-md-surface-light dark:bg-md-surface-dark" style={{ paddingBottom: 0 }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-md-outline-variant-light dark:border-md-outline-variant-dark">
        <TouchableOpacity onPress={handleGoBack} className="flex-row items-center flex-1 mr-2">
          <ArrowLeft size={24} color="#6750A4" />
          <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark ml-2" numberOfLines={1}>
            {book?.title || 'Book'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-md-label-small text-md-onSurfaceVariant-light dark:text-md-onSurfaceVariant-dark mr-2">
            {currentProgress}%
          </Text>
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="w-10 h-10 rounded-full bg-md-surfaceVariant-light dark:bg-md-surfaceVariant-dark items-center justify-center"
          >
            <Settings size={22} color="#6750A4" />
          </TouchableOpacity>
        </View>
      </View>

      {(error || loadTimedOut) && (
        <View className="absolute top-20 left-4 right-4 bg-md-errorContainer-light dark:bg-md-errorContainer-dark p-4 rounded-[16px] z-40">
          <View className="flex-row items-center justify-between">
            <Text className="text-md-body-medium text-md-onErrorContainer-light dark:text-md-onErrorContainer-dark flex-1">
              {loadTimedOut ? 'Taking too long to load. Tap retry.' : error}
            </Text>
            <TouchableOpacity onPress={() => {
              setWebViewKey(k => k + 1);
              setLoading(true);
              setContentRendered(false);
              setError(null);
              setWebViewReady(false);
              setLoadTimedOut(false);
            }} className="ml-2 p-2">
              <X size={20} color="#B3261E" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-1">
        {!source ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark text-center mb-4">
              No book source available
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="px-6 py-3 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
            >
              <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark">Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : Platform.OS === 'web' ? (
          <View className="flex-1 relative">
            <WebViewFallback
              ref={webFallbackRef}
              key={webViewKey}
              source={source}
              style={{ flex: 1, backgroundColor: themeColors.background }}
              onLoad={handleWebViewLoad}
              onLoadEnd={handleWebViewLoadEnd}
              onLoadStart={handleWebViewLoadStart}
              onMessage={handleMessage}
              onError={handleWebViewError}
              initialProgress={savedProgress}
            />
            {(showLoading || loadTimedOut) && (
              <View className="absolute inset-0 bg-md-surface-light dark:bg-md-surface-dark items-center justify-center z-10">
                {!loadTimedOut ? (
                  <View className="items-center">
                    <View className="bg-md-tertiaryContainer-light dark:bg-md-tertiaryContainer-dark px-4 py-2 rounded-full mb-6">
                      <Text className="text-md-label-medium font-semibold text-md-onTertiaryContainer-light dark:text-md-onTertiaryContainer-dark">
                        Loading book...
                      </Text>
                    </View>
                    <SkeletonReaderContent />
                  </View>
                ) : (
                  <View className="items-center p-8">
                    <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark mb-3 text-center">
                      This book is taking a while to load
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setWebViewKey(k => k + 1);
                        setLoading(true);
                        setContentRendered(false);
                        setLoadTimedOut(false);
                      }}
                      className="px-6 py-3 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
                    >
                      <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark">Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      className="mt-3 px-6 py-3"
                    >
                      <Text className="text-md-label-medium text-md-primary-light dark:text-md-primary-dark">Go Back</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 relative">
            <WebView
              key={webViewKey}
              ref={webViewRef}
              source={source}
              style={{ flex: 1, backgroundColor: themeColors.background }}
              originWhitelist={['*']}
              allowsInlineMediaPlayback
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              startInLoadingState={false}
              onLoadStart={handleWebViewLoadStart}
              onLoadEnd={handleWebViewLoadEnd}
              onError={handleWebViewError}
              onMessage={handleMessage}
              onLoad={handleWebViewLoad}
              renderError={(err: any) => (
                <View className="flex-1 items-center justify-center bg-md-surface-light dark:bg-md-surface-dark p-8">
                  <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark text-center mb-4">
                    Failed to load book
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setWebViewKey(k => k + 1);
                      setWebViewReady(false);
                      setContentRendered(false);
                    }}
                    className="px-6 py-3 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
                  >
                    <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark">Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {(showLoading || loadTimedOut) && (
              <View className="absolute inset-0 bg-md-surface-light dark:bg-md-surface-dark items-center justify-center z-10">
                {!loadTimedOut ? (
                  <View className="items-center">
                    <View className="bg-md-tertiaryContainer-light dark:bg-md-tertiaryContainer-dark px-4 py-2 rounded-full mb-6">
                      <Text className="text-md-label-medium font-semibold text-md-onTertiaryContainer-light dark:text-md-onTertiaryContainer-dark">
                        Loading book...
                      </Text>
                    </View>
                    <SkeletonReaderContent />
                  </View>
                ) : (
                  <View className="items-center p-8">
                    <Text className="text-md-title-medium text-md-onSurface-light dark:text-md-onSurface-dark mb-3 text-center">
                      This book is taking a while to load
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setWebViewKey(k => k + 1);
                        setLoading(true);
                        setContentRendered(false);
                        setLoadTimedOut(false);
                      }}
                      className="px-6 py-3 bg-md-primary-light dark:bg-md-primary-dark rounded-[20px]"
                    >
                      <Text className="text-md-label-large text-white dark:text-md-onPrimary-dark">Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      className="mt-3 px-6 py-3"
                    >
                      <Text className="text-md-label-medium text-md-primary-light dark:text-md-primary-dark">Go Back</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      <ReaderSettingsSheet
        visible={settingsVisible}
        onClose={() => {
          setSettingsVisible(false);
          if (webViewReady) {
            setTimeout(() => {
              if (Platform.OS !== 'web' && webViewRef.current) {
                const injectStyles = generateInjectStyles();
                webViewRef.current.injectJavaScript(injectStyles);
                webViewRef.current.injectJavaScript(getScrollTrackingScript());
                const pct = progressRef.current;
                if (pct > 0) {
                  setTimeout(() => {
                    try {
                      webViewRef.current?.injectJavaScript(getScrollRestoreScript(progressRef.current));
                    } catch (e) {}
                  }, 300);
                }
              }
              if (Platform.OS === 'web' && webFallbackRef.current) {
                const css = getReaderCss();
                webFallbackRef.current.postMessage({ type: 'apply-styles', css });
                const pct = progressRef.current;
                if (pct > 0) {
                  setTimeout(() => {
                    try {
                      webFallbackRef.current?.postMessage({ type: 'scroll-restore', progress: progressRef.current });
                    } catch (e) {}
                  }, 600);
                }
              }
            }, 100);
          }
        }}
      />
    </SafeAreaView>
  );
};
