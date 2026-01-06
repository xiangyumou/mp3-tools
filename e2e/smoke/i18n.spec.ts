import { test, expect } from '@playwright/test';

test.describe('Internationalization Smoke Tests', () => {
    test('English locale displays English content', async ({ page }) => {
        await page.goto('/en');

        // Wait for the page to load - use h1 specifically
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Check English-specific text
        await expect(page.locator('text=What would you like to do?')).toBeVisible();
        await expect(page.locator('h3:has-text("Concatenate Intro/Outro")').first()).toBeVisible();
    });

    test('Chinese locale displays Chinese content', async ({ page }) => {
        await page.goto('/zh');

        // Wait for the page to load - use h1 with correct Chinese title
        await expect(page.locator('h1:has-text("本地音频批量处理器")')).toBeVisible({ timeout: 30000 });

        // Check Chinese-specific text - use the correct translation
        await expect(page.locator('text=您想要做什么？')).toBeVisible();
    });

    test('language switcher toggles between English and Chinese', async ({ page }) => {
        await page.goto('/en');

        // Wait for content to load
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 30000 });

        // Find and click language switcher
        const langSwitcher = page.locator('button:has-text("English")');
        await expect(langSwitcher).toBeVisible();
        await langSwitcher.click();

        // Should navigate to Chinese
        await expect(page).toHaveURL(/\/zh/);

        // Content should now be in Chinese
        await expect(page.locator('h1:has-text("本地音频批量处理器")')).toBeVisible({ timeout: 10000 });
    });

    test('language switcher from Chinese to English', async ({ page }) => {
        await page.goto('/zh');

        // Wait for content to load
        await expect(page.locator('h1:has-text("本地音频批量处理器")')).toBeVisible({ timeout: 30000 });

        // Find and click language switcher (shows 中文 when on Chinese locale)
        const langSwitcher = page.locator('button:has-text("中文")');
        await expect(langSwitcher).toBeVisible();
        await langSwitcher.click();

        // Should navigate to English
        await expect(page).toHaveURL(/\/en/);

        // Content should now be in English
        await expect(page.locator('h1:has-text("Local Audio Batch Processor")')).toBeVisible({ timeout: 10000 });
    });

    test('mode descriptions are translated correctly', async ({ page }) => {
        // Check English
        await page.goto('/en');
        await expect(page.locator('p:has-text("Add intro and/or outro audio to your files")').first()).toBeVisible({ timeout: 30000 });

        // Check Chinese - use correct translation
        await page.goto('/zh');
        await expect(page.locator('p:has-text("在您的音频文件前后添加片头/片尾")').first()).toBeVisible({ timeout: 30000 });
    });

    test('URL structure maintains locale', async ({ page }) => {
        await page.goto('/en');
        await expect(page).toHaveURL(/^.*\/en\/?$/);

        await page.goto('/zh');
        await expect(page).toHaveURL(/^.*\/zh\/?$/);
    });
});
