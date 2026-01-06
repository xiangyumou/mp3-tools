import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    it('toggles language on click', async () => {
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
