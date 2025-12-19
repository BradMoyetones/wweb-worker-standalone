import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ThemeProvider } from '@/components/theme-provider'

// Supports weights 100-900
import '@fontsource-variable/onest';

// Styles
import '@/styles/globals.css'
import { RouterProvider } from 'react-router';
import router from './router';
import { ActiveThemeProvider } from './components/active-theme';
import { VersionProvider } from './contexts/VersionContext';
import { DataProvider, WhatsAppProvider } from './contexts';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider as NextThemesProvider } from "next-themes"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextThemesProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
      <VersionProvider>
        <WhatsAppProvider>
          <ActiveThemeProvider>
            <DataProvider>
              <RouterProvider router={router} />
            </DataProvider>
          </ActiveThemeProvider>
        </WhatsAppProvider>
      </VersionProvider>
      <Toaster />
    </NextThemesProvider>
  </StrictMode>
)
