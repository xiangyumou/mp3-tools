import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSwitcher from './ThemeSwitcher';

// Mock the localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true,
});

describe('ThemeSwitcher Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
        document.documentElement.classList.remove('dark');
    });

    it('renders correctly after mount', () => {
        render(<ThemeSwitcher />);
        // The button should be present after mount
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('displays system theme by default', () => {
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');
        // Should have aria-label
        expect(button).toHaveAttribute('aria-label', 'label');
    });

    it('cycles through themes on click', async () => {
        const user = userEvent.setup();
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');

        // Initial state is 'system', click should go to 'light'
        await user.click(button);

        // Then 'dark'
        await user.click(button);

        // Then back to 'system'
        await user.click(button);

        // Verify localStorage was called
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('saves theme to localStorage when set to light', async () => {
        const user = userEvent.setup();
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');

        // Click to go from system -> light
        await user.click(button);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('saves theme to localStorage when set to dark', async () => {
        const user = userEvent.setup();
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');

        // Click twice: system -> light -> dark
        await user.click(button);
        await user.click(button);

        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('removes theme from localStorage when set to system', async () => {
        const user = userEvent.setup();
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');

        // Click three times: system -> light -> dark -> system
        await user.click(button);
        await user.click(button);
        await user.click(button);

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme');
    });

    it('loads saved theme from localStorage on mount', () => {
        localStorageMock.getItem.mockReturnValue('dark');
        render(<ThemeSwitcher />);

        expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    });

    it('has ghost variant and sm size styling', () => {
        render(<ThemeSwitcher />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('gap-2');
    });
});
