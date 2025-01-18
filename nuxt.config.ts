import { defineNuxtConfig } from 'nuxt/config'

import vuePlugin from '@vitejs/plugin-vue'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'nuxt-security',
    '@vee-validate/nuxt',
    '@nuxt/eslint',
  ],
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.bunny.net',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.bunny.net/css?family=bungee:400|sofia-sans:200,400,400i,500,600,600i,800,900',
        },
      ],
    },
  },
  devServer: {
    port: 3000,
    host: 'localhost',
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    storageKey: 'color-mode',
  },
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css', { injectPosition: 'first' }],
    configPath: '~/tailwind.config.ts',
    exposeConfig: {
      level: 2,
    },
    config: {},
    viewer: true,
  },
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.ts',
      },
      {
        code: 'id',
        name: 'Indonesia',
        file: 'id.ts',
      },
    ],
    lazy: true,
    defaultLocale: 'en',
    langDir: './',
    vueI18n: './i18n.config.ts',
    detectBrowserLanguage: false,
  },
  piniaPluginPersistedstate: {
    key: 'nuxtreez_%id',
    cookieOptions: {
      sameSite: 'strict',
    },
    storage: 'localStorage',
  },
  imports: {
    dirs: [],
  },
  security: {
    strict: false,
    headers: {
      crossOriginResourcePolicy: 'same-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? false : 'credentialless', // USE ONLY IN DEV MODE
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        'font-src': ["'self'", 'https:', 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'img-src': ["'self'", 'data:', 'https://ui-avatars.com'],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", 'https:', "'unsafe-inline'"],
        'script-src': ["'self'", 'https:', "'unsafe-inline'", "'strict-dynamic'", "'nonce-{{nonce}}'"],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'development' ? false : true, // USE ONLY IN DEV MODE
      },
      originAgentCluster: '?1',
      referrerPolicy: 'no-referrer',
      strictTransportSecurity: {
        maxAge: 15552000, // 180 days
        includeSubdomains: true,
      },
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'SAMEORIGIN',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: '0',
      permissionsPolicy: {
        camera: [],
        'display-capture': [],
        fullscreen: [],
        geolocation: [],
        microphone: [],
      },
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 4000000, // Consider increasing to 4-5MB, default 2MB
      maxUploadFileRequestInBytes: 8000000, // 8MB
      throwError: true,
    },
    rateLimiter: {
      tokensPerInterval: 100, // Reduce to 100 for better protection, default 150 requests
      interval: 300000, // 5 Minutes
      headers: true, // Enable headers to help clients track their rate limit, default false
      driver: {
        name: 'lru-cache', // 'memory' is more efficient than 'lruCache' for small-medium apps
      },
      throwError: true,
    },
    xssValidator: {
      throwError: true,
    },
    corsHandler: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      preflight: {
        statusCode: 204,
      },
    },
    allowedMethodsRestricter: {
      methods: '*',
      throwError: true,
    },
    hidePoweredBy: true,
    basicAuth: false,
    enabled: true,
    csrf: {
      https: process.env.NODE_ENV === 'production',
      cookieKey: 'XSRF-TOKEN', // "__Host-csrf" if https is true otherwise just "csrf"
      cookie: {
        // CookieSerializeOptions from unjs/cookie-es
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      },
      methodsToProtect: ['POST', 'PUT', 'PATCH'],
      encryptSecret: process.env.NUXT_CSRF_SECRET_KEY,
      addCsrfTokenToEventCtx: false, // default false, to run useCsrfFetch on server set it to true
      headerName: 'x-csrf-token',
    },
    nonce: true,
    removeLoggers: true,
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true,
    },
    sri: true,
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  runtimeConfig: {
    jwtSecretKey: '',
    jwtRefreshSecretKey: '',
    databaseUrl: '',
    mysqlHost: '',
    mysqlPort: '',
    mysqlUser: '',
    mysqlPassword: '',
    mysqlDatabase: '',
    encryptionAlgorithm: '',
    encryptionPassword: '',
    encryptionSalt: '',
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPassword: '',
    resetPasswordUrl: '',
    public: {
      // other public config here
    },
  },
  nitro: {
    rollupConfig: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      plugins: [vuePlugin()],
    },
  },
  typescript: {
    typeCheck: true,
  },
})
