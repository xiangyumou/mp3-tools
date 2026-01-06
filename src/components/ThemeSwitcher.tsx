'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/simple-ui';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeSwitcher() {
    const t = useTranslations('ThemeSwitcher');
    const [theme, setTheme] = useState<Theme>('system');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Read saved theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        if (theme === 'system') {
            localStorage.removeItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } else if (theme === 'dark') {
            localStorage.setItem('theme', 'dark');
            root.classList.add('dark');
        } else {
            localStorage.setItem('theme', 'light');
            root.classList.remove('dark');
        }
    }, [theme, mounted]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (!mounted || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            if (e.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mounted, theme]);

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-4 h-4" />;
            case 'dark':
                return <Moon className="w-4 h-4" />;
            case 'system':
                return <Monitor className="w-4 h-4" />;
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light':
                return t('light');
            case 'dark':
                return t('dark');
            case 'system':
                return t('system');
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="gap-2"
            aria-label={t('label')}
        >
            {getIcon()}
            <span className="hidden sm:inline">{getLabel()}</span>
        </Button>
    );
}
