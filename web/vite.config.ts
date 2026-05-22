import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reactRouter } from '@react-router/dev/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';

import { defineConfig } from 'vite';

import babel from 'vite-plugin-babel';
import tsconfigPaths from 'vite-tsconfig-paths';

import { addRenderIds } from './plugins/addRenderIds';
import { aliases } from './plugins/aliases';
import consoleToParent from './plugins/console-to-parent';
import { layoutWrapperPlugin } from './plugins/layouts';
import { loadFontsFromTailwindSource } from './plugins/loadFontsFromTailwindSource';
import { nextPublicProcessEnv } from './plugins/nextPublicProcessEnv';
import { restart } from './plugins/restart';
import { restartEnvFileChange } from './plugins/restartEnvFileChange';

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = path.dirname(
  __filename
);

export default defineConfig({
  envPrefix: [
    'NEXT_PUBLIC_',
    'VITE_',
  ],

  appType: 'spa',

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',

      'fast-glob',
      'lucide-react',

      '@chakra-ui/react',

      'motion',

      'recharts',

      'lodash-es',

      'date-fns',
    ],

    exclude: [
      '@hono/auth-js/react',

      '@hono/auth-js',

      '@auth/core',

      'hono/context-storage',

      '@auth/core/errors',

      'fsevents',

      'lightningcss',
    ],
  },

  logLevel: 'info',

  build: {
    target: 'es2022',

    outDir: 'build/client',

    emptyOutDir: true,

    assetsDir: 'assets',

    sourcemap: false,

    minify: 'esbuild',

    cssMinify: true,

    reportCompressedSize: false,

    chunkSizeWarningLimit: 3000,

    copyPublicDir: true,

    modulePreload: {
      polyfill: true,
    },

    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            'react',
            'react-dom',
            'react-router',
            'react-router-dom',
          ],

          ui: [
            '@chakra-ui/react',
            'lucide-react',
            'classnames',
            'tailwind-merge',
          ],

          forms: [
            'react-hook-form',
            'yup',
          ],

          charts: [
            'recharts',
          ],

          editor: [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
          ],

          animation: [
            'motion',
            'three',
          ],

          utils: [
            'lodash-es',
            'papaparse',
            'date-fns',
          ],
        },

        chunkFileNames:
          'assets/js/[name]-[hash].js',

        entryFileNames:
          'assets/js/[name]-[hash].js',

        assetFileNames:
          'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  plugins: [
    nextPublicProcessEnv(),

    restartEnvFileChange(),

    reactRouterHonoServer({
      serverEntryPoint:
        './src/__create/index.ts',

      runtime: 'node',
    }),

    babel({
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
      ],

      exclude: /node_modules/,

      babelConfig: {
        babelrc: false,

        configFile: false,

        plugins: [
          'styled-jsx/babel',
        ],
      },
    }),

    restart({
      restart: [
        'src/**/page.jsx',
        'src/**/page.tsx',

        'src/**/layout.jsx',
        'src/**/layout.tsx',

        'src/**/route.js',
        'src/**/route.ts',
      ],
    }),

    consoleToParent(),

    loadFontsFromTailwindSource(),

    addRenderIds(),

    reactRouter({
      appDirectory: 'src/app',
    }),

    tsconfigPaths(),

    aliases(),

    layoutWrapperPlugin(),
  ],

  resolve: {
    alias: {
      lodash: 'lodash-es',

      'npm:stripe': 'stripe',

      stripe: path.resolve(
        __dirname,
        './src/__create/stripe'
      ),

      '@auth/create/react':
        '@hono/auth-js/react',

      '@auth/create': path.resolve(
        __dirname,
        './src/__create/@auth/create'
      ),

      '@': path.resolve(
        __dirname,
        './src'
      ),

      '@app': path.resolve(
        __dirname,
        './src/app'
      ),

      '@components': path.resolve(
        __dirname,
        './src/components'
      ),

      '@lib': path.resolve(
        __dirname,
        './src/lib'
      ),

      '@shared': path.resolve(
        __dirname,
        '../shared'
      ),
    },

    dedupe: [
      'react',
      'react-dom',
    ],
  },

  define: {
    __DEV__:
      process.env.NODE_ENV !==
      'production',

    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV
    ),
  },

  clearScreen: false,

  server: {
    allowedHosts: true,

    host: '0.0.0.0',

    port: 4000,

    strictPort: false,

    cors: true,

    fs: {
      allow: [
        '.',

        '..',

        '../shared',

        '../../shared',
      ],
    },

    hmr: {
      overlay: false,

      host: 'localhost',

      port: 4000,
    },

    warmup: {
      clientFiles: [
        './src/app/**/*',

        './src/components/**/*',

        './src/app/root.tsx',

        './src/app/routes.ts',
      ],
    },
  },

  preview: {
    host: '0.0.0.0',

    port: 4173,
  },
});
