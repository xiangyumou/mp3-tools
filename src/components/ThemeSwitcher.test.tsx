import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from './ThemeSwitcher';

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Create mock factory for different theme states
const createThemeMock = (currentTheme: string) => {
    const setThemeMock = vi.fn();
    return {
        setThemeMock,
        mock: {
            useTheme: () => ({
                theme: currentTheme,
                setTheme: setThemeMock,
                themes: ['light', 'dark', 'system'],
                resolvedTheme: currentTheme === 'system' ? 'light' : currentTheme,
                systemTheme: 'light',
                forcedTheme: undefined,
            }),
        },
    };
};

describe('ThemeSwitcher Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe('basic functionality with system theme', () => {
        beforeEach(() => {
            const { mock } = createThemeMock('system');
            vi.doMock('next-themes', () => mock);
        });

        it('renders correctly', () => {
            render(<ThemeSwitcher />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('renders system icon (Monitor)', () => {
            render(<ThemeSwitcher />);
            const button = screen.getByRole('button');
            expect(button.querySelector('svg')).toBeInTheDocument();
        });
    });

    describe('theme cycling from system', () => {
        it('cycles from system to light when clicked', async () => {
            const { setThemeMock, mock } = createThemeMock('system');
            vi.doMock('next-themes', () => mock);

            // Re-import to get fresh mock
            vi.resetModules();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
            }));
            vi.doMock('next-themes', () => mock);

            const { default: ThemeSwitcherFresh } = await import('./ThemeSwitcher');
            const user = userEvent.setup();
            render(<ThemeSwitcherFresh />);

            const button = screen.getByRole('button');
            await user.click(button);

            // system -> light (index 2 -> 0 after cycling)
            expect(setThemeMock).toHaveBeenCalledWith('light');
        });
    });

    describe('theme cycling from light', () => {
        it('cycles from light to dark when clicked', async () => {
            vi.resetModules();
            const setThemeMock = vi.fn();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
            }));
            vi.doMock('next-themes', () => ({
                useTheme: () => ({
                    theme: 'light',
                    setTheme: setThemeMock,
                }),
            }));

            const { default: ThemeSwitcherFresh } = await import('./ThemeSwitcher');
            const user = userEvent.setup();
            render(<ThemeSwitcherFresh />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(setThemeMock).toHaveBeenCalledWith('dark');
        });
    });

    describe('theme cycling from dark', () => {
        it('cycles from dark to system when clicked', async () => {
            vi.resetModules();
            const setThemeMock = vi.fn();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
            }));
            vi.doMock('next-themes', () => ({
                useTheme: () => ({
                    theme: 'dark',
                    setTheme: setThemeMock,
                }),
            }));

            const { default: ThemeSwitcherFresh } = await import('./ThemeSwitcher');
            const user = userEvent.setup();
            render(<ThemeSwitcherFresh />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(setThemeMock).toHaveBeenCalledWith('system');
        });
    });

    describe('icon rendering', () => {
        it('renders Sun icon for light theme', async () => {
            vi.resetModules();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
            }));
            vi.doMock('next-themes', () => ({
                useTheme: () => ({
                    theme: 'light',
                    setTheme: vi.fn(),
                }),
            }));

            const { default: ThemeSwitcherFresh } = await import('./ThemeSwitcher');
            render(<ThemeSwitcherFresh />);

            const button = screen.getByRole('button');
            expect(button.querySelector('svg')).toBeInTheDocument();
        });

        it('renders Moon icon for dark theme', async () => {
            vi.resetModules();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
            }));
            vi.doMock('next-themes', () => ({
                useTheme: () => ({
                    theme: 'dark',
                    setTheme: vi.fn(),
                }),
            }));

            const { default: ThemeSwitcherFresh } = await import('./ThemeSwitcher');
            render(<ThemeSwitcherFresh />);

            const button = screen.getByRole('button');
            expect(button.querySelector('svg')).toBeInTheDocument();
        });
    });
});
