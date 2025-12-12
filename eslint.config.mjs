import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import js from '@eslint/js'

export default defineConfig(
  // 1. Configuración de ignorados (ignora)
  {
    ignores: ['**/node_modules', '**/dist', '**/out']
  },

  // 2. Configuración Recomendada de JavaScript (js.configs.recommended)
  js.configs.recommended,

  // 3. Configuración Recomendada de TypeScript (tseslint.configs.recommended)
  tseslint.configs.recommended,

  // 4. Configuración React Recomendada (plugin:react/recommended)
  eslintPluginReact.configs.flat.recommended,

  // 5. Configuración React JSX-Runtime (plugin:react/jsx-runtime)
  eslintPluginReact.configs.flat['jsx-runtime'],

  // 6. Configuración de Entorno y React Settings
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser // Asegura que 'browser' esté disponible
    },
    settings: {
      react: {
        version: 'detect' // Detecta automáticamente la versión de React
      }
    }
  },

  // 7. Configuración específica de archivos, plugins y reglas
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      // Reglas de react-hooks (spread de .configs.recommended.rules)
      ...eslintPluginReactHooks.configs.recommended.rules,

      'prefer-const': 'off',

      // Regla @typescript-eslint/no-explicit-any
      '@typescript-eslint/no-explicit-any': 'off',

      // Regla react-refresh/only-export-components (con la opción { allowConstantExport: true })
      'react-refresh/only-export-components': [
        'off',
        { allowConstantExport: true }
      ],

      // ¡IMPORTANTE! Para permitir tu función 'cn' sin el tipo de retorno:
      // Desactivar la regla 'explicit-function-return-type' de TypeScript
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-implicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  },
)