import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from './ThemeSwitcher';

// Mock next-themes
const setThemeMock = vi.fn();
vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'system',
        setTheme: setThemeMock,
    }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

describe('ThemeSwitcher Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ThemeSwitcher />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls setTheme when clicked', async () => {
        const user = userEvent.setup();
        render(<ThemeSwitcher />);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(setThemeMock).toHaveBeenCalled();
    });
});
