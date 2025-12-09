import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ThemeProvider } from '@/components/theme-provider'

// Supports weights 100-900
import '@fontsource-variable/onest';

// Styles
import '@/styles/globals.css'
import { RouterProvider } from 'react-router';
import router from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
