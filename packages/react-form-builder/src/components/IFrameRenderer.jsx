import { createPortal } from 'react-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useEffect, useRef, useState } from 'react';

export const IFrameRenderer = ({ width, theme, children }) => {
  const iframeRef = useRef(null);
  const cacheRef = useRef(null);
  const initializedRef = useRef(false);
  const [iframeDoc, setIframeDoc] = useState(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;"></body>
      </html>
    `);
    doc.close();

    cacheRef.current = createCache({
      key: 'mui-iframe',
      container: doc.head,
      prepend: true,
    });

    setIframeDoc(doc);
  }, []);

  return (
    <div
      style={{
        width,
        margin: '0 auto',
        height: '80vh',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <iframe
        ref={iframeRef}
        title="Responsive Preview"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />

      {iframeDoc &&
        cacheRef.current &&
        createPortal(
          <CacheProvider value={cacheRef.current}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </CacheProvider>,
          iframeDoc.body
        )}
    </div>
  );
};
