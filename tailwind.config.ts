import type { Config } from 'tailwindcss';

export default {
    content: [
        "./src/**/*.{html,ts}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Gray Scale (Apple-inspired)
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
                // Brand Colors
                brand: {
                    main: '#3b82f6',
                    hover: '#2563eb',
                    soft: '#dbeafe',
                    light: '#eff6ff',
                },
                // Semantic Colors
                success: {
                    bg: '#dcfce7',
                    text: '#16a34a',
                    border: '#86efac',
                },
                warning: {
                    bg: '#fef3c7',
                    text: '#d97706',
                    border: '#fcd34d',
                },
                error: {
                    bg: '#fee2e2',
                    text: '#dc2626',
                    border: '#fca5a5',
                },
                info: {
                    bg: '#dbeafe',
                    text: '#2563eb',
                    border: '#93c5fd',
                },
                // Surface Colors
                surface: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
                // Background Colors
                bg: {
                    primary: 'var(--bg-page)',
                    secondary: 'var(--bg-page)',
                    muted: 'var(--bg-muted)',
                    surface: 'var(--bg-surface)',
                },
                // Text Colors
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                    inverse: '#ffffff',
                },
                // Border Colors
                border: {
                    default: 'var(--border-default)',
                    muted: 'var(--border-muted)',
                    focus: 'var(--brand-main)',
                },
            },
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
                mono: [
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    'monospace',
                ],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
            fontWeight: {
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
            },
            letterSpacing: {
                'tight': '-0.025em',
                'normal': '0',
                'wide': '0.025em',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'apple': '0.75rem',
                'apple-lg': '1rem',
                'apple-xl': '1.25rem',
            },
            boxShadow: {
                'apple-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'apple': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'apple-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'apple-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'apple-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                'apple-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                'focus': '0 0 0 3px rgba(59, 130, 246, 0.3)',
            },
            transitionDuration: {
                '150': '150ms',
                '300': '300ms',
            },
            transitionTimingFunction: {
                'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            animation: {
                'shimmer': 'shimmer 1.5s infinite',
                'fade-in': 'fadeIn 150ms ease-out',
                'fade-out': 'fadeOut 150ms ease-in',
                'slide-up': 'slideUp 200ms ease-out',
                'slide-down': 'slideDown 200ms ease-out',
                'scale-in': 'scaleIn 150ms ease-out',
                'scale-out': 'scaleOut 150ms ease-in',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                scaleOut: {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(0.95)', opacity: '0' },
                },
            },
            zIndex: {
                'dropdown': 1000,
                'sticky': 1020,
                'fixed': 1030,
                'modal-backdrop': 1040,
                'modal': 1050,
                'popover': 1060,
                'tooltip': 1070,
            },
        },
    },
    plugins: [],
} satisfies Config;
