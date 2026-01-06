import { test, expect } from '@playwright/test';

test.describe('Homepage Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the default locale
        await page.goto('/en');
    });

    test('page loads successfully', async ({ page }) => {
        // Page should have loaded without errors
        await expect(page).toHaveURL(/\/en/);
    });

    test('page has correct title', async ({ page }) => {
        // Check the page title contains expected text
        await expect(page).toHaveTitle(/Audio Batch Processor/);
    });

    test('main heading is visible', async ({ page }) => {
        // The audio processor title is now in the Card header
        const title = page.locator('text=Audio Batch Processor').first();
        await expect(title).toBeVisible({ timeout: 10000 });
    });

    test('step indicator is visible after FFmpeg loads', async ({ page }) => {
        // Wait for FFmpeg to load and step indicator to appear
        const stepIndicator = page.locator('text=Mode');
        await expect(stepIndicator.first()).toBeVisible({ timeout: 30000 });
    });

    test('mode selection cards are visible', async ({ page }) => {
        // Wait for mode selection to be available (only 2 modes exist)
        await expect(page.locator('text=Add Intro/Outro').first()).toBeVisible({ timeout: 30000 });
        await expect(page.locator('text=Trim Audio').first()).toBeVisible();
    });

    test('language switcher is visible', async ({ page }) => {
        // Language switcher button should be present
        const langSwitcher = page.locator('button:has-text("English")');
        await expect(langSwitcher).toBeVisible();
    });

    test('theme switcher is visible', async ({ page }) => {
        // Wait for page to load first
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 10000 });

        // Theme switcher button should be in the top-right corner (has SVG icon)
        const themeButtons = page.locator('button:has(svg)');
        await expect(themeButtons.first()).toBeVisible();
    });

    test('no console errors on page load', async ({ page }) => {
        const consoleErrors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/en');
        // Wait for FFmpeg to load
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 30000 });

        // Filter out expected errors (like FFmpeg loading issues in test env)
        const unexpectedErrors = consoleErrors.filter(
            (err) => !err.includes('ffmpeg') && !err.includes('SharedArrayBuffer') && !err.includes('Cross-Origin')
        );

        expect(unexpectedErrors).toHaveLength(0);
    });
});

test.describe('Navigation Smoke Tests', () => {
    test('navigating to Chinese locale works', async ({ page }) => {
        await page.goto('/zh');
        await expect(page).toHaveURL(/\/zh/);
    });

    test('navigating to English locale works', async ({ page }) => {
        await page.goto('/en');
        await expect(page).toHaveURL(/\/en/);
    });

    test('default path redirects to locale', async ({ page }) => {
        await page.goto('/');
        // Should redirect to a locale path
        await expect(page).toHaveURL(/\/(en|zh)/);
    });
});
