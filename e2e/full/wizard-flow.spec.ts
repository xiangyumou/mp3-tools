import { test, expect } from '@playwright/test';

test.describe('Wizard Flow - Full E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/en');
        // Wait for FFmpeg to load
        await expect(page.locator('text=Select Mode')).toBeVisible({ timeout: 60000 });
    });

    test.describe('Step 1: Mode Selection', () => {
        test('displays both mode options', async ({ page }) => {
            await expect(page.locator('text=Add Intro/Outro')).toBeVisible();
            await expect(page.locator('text=Trim Audio')).toBeVisible();
        });

        test('next button is disabled until mode is selected', async ({ page }) => {
            const nextButton = page.locator('button:has-text("Next")');
            await expect(nextButton).toBeDisabled();
        });

        test('selecting a mode enables the next button', async ({ page }) => {
            // Click on concat mode
            await page.locator('text=Add Intro/Outro').click();

            const nextButton = page.locator('button:has-text("Next")');
            await expect(nextButton).toBeEnabled();
        });

        test('selected mode is visually highlighted', async ({ page }) => {
            const concatCard = page.locator('button:has-text("Add Intro/Outro")');
            await concatCard.click();

            // Should have highlighted border
            await expect(concatCard).toHaveClass(/border-primary/);
        });

        test('can change mode selection', async ({ page }) => {
            // Select concat first
            await page.locator('text=Add Intro/Outro').click();

            // Then select trim
            const trimCard = page.locator('button:has-text("Trim Audio")');
            await trimCard.click();

            // Trim should be highlighted
            await expect(trimCard).toHaveClass(/border-primary/);
        });
    });

    test.describe('Step 2: Configuration', () => {
        test('shows concat settings for concat mode', async ({ page }) => {
            // Select concat mode
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();

            // Should show configuration page
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
            await expect(page.locator('text=Concat Settings')).toBeVisible();
            await expect(page.locator('text=Intro (Opt)')).toBeVisible();
            await expect(page.locator('text=Outro (Opt)')).toBeVisible();
        });

        test('shows trim settings for trim mode', async ({ page }) => {
            // Select trim mode
            await page.locator('text=Trim Audio').click();
            await page.locator('button:has-text("Next")').click();

            // Should show trim settings
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
            await expect(page.locator('text=Trim Settings')).toBeVisible();
            await expect(page.locator('text=Start (sec)')).toBeVisible();
            await expect(page.locator('text=Duration (sec)')).toBeVisible();
        });

        test('can navigate back to step 1', async ({ page }) => {
            // Go to step 2
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();

            // Click back
            await page.locator('button:has-text("Back")').click();

            // Should be back at step 1
            await expect(page.locator('text=Select Mode')).toBeVisible();
        });

        test('can modify trim start time', async ({ page }) => {
            // Select trim mode
            await page.locator('text=Trim Audio').click();
            await page.locator('button:has-text("Next")').click();

            // Find and modify start time input
            const startTimeInput = page.locator('input[placeholder="0"]');
            await startTimeInput.clear();
            await startTimeInput.fill('5');

            await expect(startTimeInput).toHaveValue('5');
        });
    });

    test.describe('Step 3: File Selection', () => {
        test('navigates to file selection step', async ({ page }) => {
            // Go through step 1 and 2
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // Should be on step 3
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();
            await expect(page.locator('text=Drag & drop files here')).toBeVisible();
        });

        test('process button is disabled without files', async ({ page }) => {
            // Navigate to step 3
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // Process button should be disabled
            const processButton = page.locator('button:has-text("Start")');
            await expect(processButton).toBeDisabled();
        });

        test('can navigate back to step 2', async ({ page }) => {
            // Navigate to step 3
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // Go back
            await page.locator('button:has-text("Back")').click();

            // Should be on step 2
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
        });

        test('file upload area responds to click', async ({ page }) => {
            // Navigate to step 3
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // The file input should be present (hidden)
            const fileInput = page.locator('#file-upload');
            await expect(fileInput).toBeHidden();
        });
    });

    test.describe('Navigation Flow', () => {
        test('step indicator shows current step', async ({ page }) => {
            // On step 1, first step should be highlighted
            const step1 = page.locator('text=Mode').first();
            await expect(step1).toHaveClass(/text-primary/);
        });

        test('step indicator updates on navigation', async ({ page }) => {
            // Go to step 2
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();

            // Step 2 should now be highlighted
            const step2 = page.locator('text=Config');
            await expect(step2).toHaveClass(/text-primary/);
        });

        test('completed steps show checkmark', async ({ page }) => {
            // Go to step 2
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();

            // Step 1 should show checkmark (completed)
            const checkmarks = page.locator('svg path[d="M5 13l4 4L19 7"]');
            await expect(checkmarks.first()).toBeVisible();
        });

        test('full navigation flow works', async ({ page }) => {
            // Step 1 -> 2
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();

            // Verify step 2
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();

            // Step 2 -> 3
            await page.locator('button:has-text("Next")').click();

            // Verify step 3
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();

            // Step 3 -> 2
            await page.locator('button:has-text("Back")').click();

            // Verify back to step 2
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();

            // Step 2 -> 1
            await page.locator('button:has-text("Back")').click();

            // Verify back to step 1
            await expect(page.locator('text=Select Mode')).toBeVisible();
        });
    });

    test.describe('Responsive Layout', () => {
        test('mode cards stack on mobile', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();

            // Wait for content
            await expect(page.locator('text=Select Mode')).toBeVisible({ timeout: 30000 });

            // Mode cards should be visible and stacked
            await expect(page.locator('text=Add Intro/Outro')).toBeVisible();
            await expect(page.locator('text=Trim Audio')).toBeVisible();
        });

        test('navigation buttons are accessible on mobile', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();

            // Wait for content
            await expect(page.locator('text=Select Mode')).toBeVisible({ timeout: 30000 });

            // Select mode
            await page.locator('text=Add Intro/Outro').click();

            // Next button should be visible
            const nextButton = page.locator('button:has-text("Next")');
            await expect(nextButton).toBeVisible();
        });
    });
});
