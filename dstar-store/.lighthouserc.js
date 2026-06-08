export default {
  ci: {
    collect: {
      url: [
        'http://localhost:8888/',
        'http://localhost:8888/producto.html',
        'http://localhost:8888/blog/born-to-shine-detras-del-drop.html',
      ],
      numberOfRuns: 3,
      settings: {
        // Throttling: emula conexión móvil lenta (4G) — escenario realista
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['warn',  { minScore: 0.8  }],
        'categories:accessibility':  ['error', { minScore: 0.9  }],
        'categories:best-practices': ['warn',  { minScore: 0.9  }],
        'categories:seo':            ['warn',  { minScore: 0.8  }],
        // Core Web Vitals
        'largest-contentful-paint':  ['warn',  { maxNumericValue: 3000 }],
        'total-blocking-time':       ['warn',  { maxNumericValue: 300  }],
        'cumulative-layout-shift':   ['warn',  { maxNumericValue: 0.1  }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
