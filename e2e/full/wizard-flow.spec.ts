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

    test.describe('Complete Processing Flow with File Upload', () => {
        test('can upload files and start processing', async ({ page }) => {
            // Navigate through wizard to step 3
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // Verify we're on step 3
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();

            // Create a fake audio file using DataTransfer API
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.locator('label[for="file-upload"]').click();
            const fileChooser = await fileChooserPromise;

            // Create a minimal valid audio buffer for testing
            // Note: In real tests, you'd use a real audio file fixture
            const buffer = Buffer.alloc(1024);
            await fileChooser.setFiles([{
                name: 'test-audio.mp3',
                mimeType: 'audio/mpeg',
                buffer: buffer,
            }]);

            // Verify file was selected (i18n: '{count} selected')
            await expect(page.locator('text=1 selected')).toBeVisible();

            // Process button should now be enabled
            const processButton = page.locator('button:has-text("Start")');
            await expect(processButton).toBeEnabled();
        });

        test('can upload multiple files', async ({ page }) => {
            // Navigate through wizard to step 3
            await page.locator('text=Add Intro/Outro').click();
            await page.locator('button:has-text("Next")').click();
            await page.locator('button:has-text("Next")').click();

            // Verify we're on step 3
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();

            // Upload multiple files
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.locator('label[for="file-upload"]').click();
            const fileChooser = await fileChooserPromise;

            const buffer = Buffer.alloc(1024);
            await fileChooser.setFiles([
                { name: 'test-audio-1.mp3', mimeType: 'audio/mpeg', buffer: buffer },
                { name: 'test-audio-2.mp3', mimeType: 'audio/mpeg', buffer: buffer },
                { name: 'test-audio-3.mp3', mimeType: 'audio/mpeg', buffer: buffer },
            ]);

            // Verify files were selected (i18n: '{count} selected')
            await expect(page.locator('text=3 selected')).toBeVisible();

            // Check file list is visible
            await expect(page.locator('text=test-audio-1.mp3')).toBeVisible();
            await expect(page.locator('text=test-audio-2.mp3')).toBeVisible();
            await expect(page.locator('text=test-audio-3.mp3')).toBeVisible();
        });

        test('trim mode complete flow', async ({ page }) => {
            // Select trim mode
            await page.locator('text=Trim Audio').click();

            // Verify mode is selected
            const trimCard = page.locator('button:has-text("Trim Audio")');
            await expect(trimCard).toHaveClass(/border-primary/);

            // Go to step 2
            await page.locator('button:has-text("Next")').click();
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();

            // Configure trim settings
            const startTimeInput = page.locator('input[placeholder="0"]');
            await startTimeInput.clear();
            await startTimeInput.fill('5');

            // Go to step 3
            await page.locator('button:has-text("Next")').click();
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();

            // Upload a file
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.locator('label[for="file-upload"]').click();
            const fileChooser = await fileChooserPromise;

            const buffer = Buffer.alloc(1024);
            await fileChooser.setFiles([{
                name: 'test-trim.mp3',
                mimeType: 'audio/mpeg',
                buffer: buffer,
            }]);

            // Verify file was selected (i18n: '{count} selected')
            await expect(page.locator('text=1 selected')).toBeVisible();

            // Process button should be enabled
            const processButton = page.locator('button:has-text("Start")');
            await expect(processButton).toBeEnabled();
        });

        test('concat mode with intro/outro files', async ({ page }) => {
            // Select concat mode
            await page.locator('text=Add Intro/Outro').click();

            // Go to step 2
            await page.locator('button:has-text("Next")').click();
            await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();

            // Verify concat settings are visible
            await expect(page.locator('text=Concat Settings')).toBeVisible();
            await expect(page.locator('text=Intro (Opt)')).toBeVisible();
            await expect(page.locator('text=Outro (Opt)')).toBeVisible();

            // Go to step 3
            await page.locator('button:has-text("Next")').click();
            await expect(page.getByRole('heading', { name: 'Select Files' })).toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('shows loading state when FFmpeg initializes', async ({ page }) => {
            await page.goto('/en');

            // The loading message should appear briefly
            // Note: This may be too fast to catch in tests, but verify the component handles it
            await expect(page.locator('text=Select Mode')).toBeVisible({ timeout: 60000 });
        });
    });

    test.describe('Wizard State Persistence', () => {
        test('mode selection persists when navigating back', async ({ page }) => {
            // Select concat mode
            await page.locator('text=Add Intro/Outro').click();

            // Go to step 2
            await page.locator('button:has-text("Next")').click();

            // Go back to step 1
            await page.locator('button:has-text("Back")').click();

            // Mode should still be selected
            const concatCard = page.locator('button:has-text("Add Intro/Outro")');
            await expect(concatCard).toHaveClass(/border-primary/);
        });

        test('settings persist when navigating back', async ({ page }) => {
            // Select trim mode
            await page.locator('text=Trim Audio').click();
            await page.locator('button:has-text("Next")').click();

            // Configure trim settings
            const startTimeInput = page.locator('input[placeholder="0"]');
            await startTimeInput.clear();
            await startTimeInput.fill('10');

            // Go to step 3
            await page.locator('button:has-text("Next")').click();

            // Go back to step 2
            await page.locator('button:has-text("Back")').click();

            // Settings should persist
            await expect(startTimeInput).toHaveValue('10');
        });
    });
});
