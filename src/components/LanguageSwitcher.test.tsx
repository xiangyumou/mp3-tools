import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';

// Mock next-intl
const mockPush = vi.fn();

vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/en',
}));

describe('LanguageSwitcher Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('English locale', () => {
        it('renders correctly', () => {
            render(<LanguageSwitcher />);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('displays current language (English)', () => {
            render(<LanguageSwitcher />);
            expect(screen.getByText('English')).toBeInTheDocument();
        });

        it('has ghost variant styling', () => {
            render(<LanguageSwitcher />);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('gap-2');
        });

        it('toggles language to Chinese on click', async () => {
            const user = userEvent.setup();
            render(<LanguageSwitcher />);
            const button = screen.getByRole('button');

            await user.click(button);

            // Should navigate to the new locale path
            expect(mockPush).toHaveBeenCalledWith('/zh');
        });

        it('renders globe icon', () => {
            render(<LanguageSwitcher />);
            // Check for SVG icon (Globe from lucide-react)
            const svg = document.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveClass('w-4', 'h-4');
        });
    });

    describe('Chinese locale', () => {
        beforeEach(() => {
            cleanup();
        });

        it('displays current language (Chinese)', async () => {
            vi.resetModules();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
                useLocale: () => 'zh',
            }));
            vi.doMock('next/navigation', () => ({
                useRouter: () => ({
                    push: mockPush,
                    replace: vi.fn(),
                    back: vi.fn(),
                }),
                usePathname: () => '/zh',
            }));

            const { default: LanguageSwitcherFresh } = await import('./LanguageSwitcher');
            render(<LanguageSwitcherFresh />);
            expect(screen.getByText('中文')).toBeInTheDocument();
        });

        it('toggles language to English on click from Chinese', async () => {
            vi.resetModules();
            const mockPushZh = vi.fn();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
                useLocale: () => 'zh',
            }));
            vi.doMock('next/navigation', () => ({
                useRouter: () => ({
                    push: mockPushZh,
                    replace: vi.fn(),
                    back: vi.fn(),
                }),
                usePathname: () => '/zh',
            }));

            const { default: LanguageSwitcherFresh } = await import('./LanguageSwitcher');
            const user = userEvent.setup();
            render(<LanguageSwitcherFresh />);

            const button = screen.getByRole('button');
            await user.click(button);

            // Should navigate to English locale path
            expect(mockPushZh).toHaveBeenCalledWith('/en');
        });

        it('handles deep paths correctly', async () => {
            vi.resetModules();
            const mockPushDeep = vi.fn();
            vi.doMock('next-intl', () => ({
                useTranslations: () => (key: string) => key,
                useLocale: () => 'zh',
            }));
            vi.doMock('next/navigation', () => ({
                useRouter: () => ({
                    push: mockPushDeep,
                    replace: vi.fn(),
                    back: vi.fn(),
                }),
                usePathname: () => '/zh/some/deep/path',
            }));

            const { default: LanguageSwitcherFresh } = await import('./LanguageSwitcher');
            const user = userEvent.setup();
            render(<LanguageSwitcherFresh />);

            const button = screen.getByRole('button');
            await user.click(button);

            // Should navigate to English locale path preserving deep path
            expect(mockPushDeep).toHaveBeenCalledWith('/en/some/deep/path');
        });
    });
});

