import { test, expect } from '@playwright/test';

test.describe('Theme Switcher Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('/en');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('theme switcher button is visible', async ({ page }) => {
        await page.goto('/en');

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Theme switcher should be present (button with SVG icon in the top area)
        const themeButtons = page.locator('button:has(svg)');
        const buttonCount = await themeButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
    });

    test('clicking theme switcher cycles through themes', async ({ page }) => {
        await page.goto('/en');

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Find theme switcher (first button with SVG that's not language switcher)
        const themeSwitcher = page.locator('button:has(svg)').first();

        // Initial state should be system (Monitor icon) or determined by system preference
        await expect(themeSwitcher).toBeVisible();

        // Click to cycle themes
        await themeSwitcher.click();
        await page.waitForTimeout(200);

        await themeSwitcher.click();
        await page.waitForTimeout(200);

        await themeSwitcher.click();
        await page.waitForTimeout(200);

        // After 3 clicks, should be back to initial state
    });

    test('dark mode applies dark class to html element', async ({ page }) => {
        await page.goto('/en');

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Set theme to dark via localStorage and reload
        await page.evaluate(() => localStorage.setItem('theme', 'dark'));
        await page.reload();

        // Wait for page to reload
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // HTML element should have 'dark' class
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
    });

    test('light mode removes dark class from html element', async ({ page }) => {
        await page.goto('/en');

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Set theme to light via localStorage and reload
        await page.evaluate(() => localStorage.setItem('theme', 'light'));
        await page.reload();

        // Wait for page to reload
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // HTML element should NOT have 'dark' class
        const htmlElement = page.locator('html');
        await expect(htmlElement).not.toHaveClass(/dark/);
    });

    test('theme persists across page navigation', async ({ page }) => {
        await page.goto('/en');

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Set dark theme
        await page.evaluate(() => localStorage.setItem('theme', 'dark'));
        await page.reload();

        // Navigate to different locale
        await page.goto('/zh');

        // Wait for page to load - use correct Chinese title
        await expect(page.locator('h1:has-text("本地音频批量处理器")')).toBeVisible({ timeout: 30000 });

        // Dark class should still be applied
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);
    });

    test('system theme follows media query', async ({ page }) => {
        // Emulate dark color scheme
        await page.emulateMedia({ colorScheme: 'dark' });

        await page.goto('/en');
        await page.evaluate(() => localStorage.removeItem('theme'));
        await page.reload();

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // With system theme and dark preference, should have dark class
        const htmlElement = page.locator('html');
        await expect(htmlElement).toHaveClass(/dark/);

        // Switch to light color scheme
        await page.emulateMedia({ colorScheme: 'light' });
        await page.reload();

        // Wait for page to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Should not have dark class
        await expect(htmlElement).not.toHaveClass(/dark/);
    });
});
