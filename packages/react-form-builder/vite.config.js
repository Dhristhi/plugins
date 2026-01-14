import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'FormBuilder',
      fileName: 'index',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@mui/system',
        '@mui/x-date-pickers',
        '@jsonforms/core',
        '@jsonforms/react',
        '@jsonforms/material-renderers',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/modifiers',
        '@emotion/react',
        '@emotion/styled',
        '@tabler/icons-react',
        'react-i18next',
        'i18next',
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          '@mui/system': 'MaterialUISystem',
          '@emotion/styled': 'EmotionStyled',
          '@emotion/react': 'EmotionReact',
          '@dnd-kit/core': 'DndKitCore',
          '@dnd-kit/sortable': 'DndKitSortable',
          '@dnd-kit/modifiers': 'DndKitModifiers',
          '@jsonforms/core': 'JsonFormsCore',
          '@jsonforms/react': 'JsonFormsReact',
          '@jsonforms/material-renderers': 'JsonFormsMaterialRenderers',
          '@tabler/icons-react': 'TablerIconsReact',
          'react-i18next': 'ReactI18next',
          i18next: 'I18next',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.js'],
    globals: true,
  },
});
