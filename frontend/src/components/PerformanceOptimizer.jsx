import React, { Suspense, lazy, memo, useCallback, useMemo } from 'react';

// Lazy loading de componentes pesados
const LazyDashboard = lazy(() => import('./DashboardFunctional'));
const LazyContactForm = lazy(() => import('./ContactForm'));

// Componente de Loading otimizado
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
));

// Hook para debounce otimizado
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttle otimizado
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Componente para lazy loading de imagens
export const LazyImage = memo(({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && placeholder && (
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse">
          {placeholder}
        </div>
      )}
    </div>
  );
});

// Componente para virtualização de listas grandes
export const VirtualizedList = memo(({ items, renderItem, itemHeight = 50 }) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef();
  const containerHeight = 400; // Altura do container
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(() => 
    items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleStart + index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// Componente para cache de dados
export const DataCache = (() => {
  const cache = new Map();
  const maxSize = 100;

  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    has: (key) => cache.has(key),
    clear: () => cache.clear()
  };
})();

// Hook para cache de requisições
export const useCachedFetch = (url, options = {}) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const cacheKey = `${url}-${JSON.stringify(options)}`;
      
      if (DataCache.has(cacheKey)) {
        setData(DataCache.get(cacheKey));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(url, options);
        const result = await response.json();
        
        DataCache.set(cacheKey, result);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};

// Componente principal de otimização
const PerformanceOptimizer = ({ children }) => {
  // Preload de recursos críticos
  React.useEffect(() => {
    // Preload de fontes
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload de imagens críticas
    const criticalImages = [
      '/images/hero-bg.jpg',
      '/images/logo.png'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Service Worker para cache
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

export default memo(PerformanceOptimizer);
