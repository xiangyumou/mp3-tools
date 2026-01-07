import { test, expect } from '@playwright/test';

test.describe('Internationalization Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`[BROWSER-${msg.type()}] ${msg.text()}`));
    });

    test('English locale displays English content', async ({ page }) => {
        await page.goto('/en');

        // Wait for the page to load - use text locator with increased timeout
        // Check if loading failed
        const errorText = page.locator('text=Failed to load');
        if (await errorText.isVisible()) {
            throw new Error('FFmpeg failed to load');
        }
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 60000 });

        // Check English-specific text. This appears after FFmpeg loads.
        await expect(page.locator('text=Select Mode')).toBeVisible({ timeout: 60000 });
        await expect(page.locator('h3:has-text("Add Intro/Outro")').first()).toBeVisible();
    });

    test('Chinese locale displays Chinese content', async ({ page }) => {
        await page.goto('/zh');

        // Wait for the page to load - use text locator with increased timeout
        await expect(page.locator('text=音频批量处理').first()).toBeVisible({ timeout: 60000 });

        // Check Chinese-specific text - use the correct translation. This appears after FFmpeg loads.
        await expect(page.locator('text=选择模式')).toBeVisible({ timeout: 60000 });
    });

    test('language switcher toggles between English and Chinese', async ({ page }) => {
        await page.goto('/en');

        // Wait for content to load
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 60000 });

        // Find and click language switcher
        const langSwitcher = page.locator('button:has-text("English")');
        await expect(langSwitcher).toBeVisible();
        await langSwitcher.click();

        // Should navigate to Chinese
        await expect(page).toHaveURL(/\/zh/);

        // Content should now be in Chinese
        await expect(page.locator('text=音频批量处理').first()).toBeVisible({ timeout: 10000 });
    });

    test('language switcher from Chinese to English', async ({ page }) => {
        await page.goto('/zh');

        // Wait for content to load
        await expect(page.locator('text=音频批量处理').first()).toBeVisible({ timeout: 60000 });

        // Find and click language switcher (shows 中文 when on Chinese locale)
        const langSwitcher = page.locator('button:has-text("中文")');
        await expect(langSwitcher).toBeVisible();
        await langSwitcher.click();

        // Should navigate to English
        await expect(page).toHaveURL(/\/en/);

        // Content should now be in English
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 10000 });
    });

    test('mode descriptions are translated correctly', async ({ page }) => {
        // Check English
        await page.goto('/en');
        // Wait for FFmpeg to load first
        await expect(page.locator('text=Audio Batch Processor').first()).toBeVisible({ timeout: 60000 });
        await expect(page.locator('p:has-text("Append audio to start/end")').first()).toBeVisible({ timeout: 60000 });

        // Check Chinese - use correct translation
        await page.goto('/zh');
        // Wait for FFmpeg to load first
        await expect(page.locator('text=音频批量处理').first()).toBeVisible({ timeout: 60000 });
        await expect(page.locator('p:has-text("前后添加音频")').first()).toBeVisible({ timeout: 60000 });
    });

    test('URL structure maintains locale', async ({ page }) => {
        await page.goto('/en');
        await expect(page).toHaveURL(/^.*\/en\/?$/);

        await page.goto('/zh');
        await expect(page).toHaveURL(/^.*\/zh\/?$/);
    });
});
