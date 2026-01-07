import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    timeout: 90 * 1000,
    projects: [
        {
            name: 'smoke',
            testDir: './e2e/smoke',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium',
            testDir: './e2e/full',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            testDir: './e2e/full',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            testDir: './e2e/full',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
