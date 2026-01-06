import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock FFmpeg with proper class that can be instantiated
const mockFFmpegInstance = {
    on: vi.fn(),
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    exec: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@ffmpeg/ffmpeg', () => ({
    FFmpeg: vi.fn().mockImplementation(function () {
        return mockFFmpegInstance;
    }),
}));

vi.mock('@ffmpeg/util', () => ({
    toBlobURL: vi.fn().mockResolvedValue('blob:mock'),
    fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Import after mocks
import AudioProcessor from './AudioProcessor';

describe('AudioProcessor Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial Render', () => {
        it('renders the component', async () => {
            render(<AudioProcessor />);

            // Should show loading message initially
            await waitFor(() => {
                expect(screen.getByText('title')).toBeInTheDocument();
            });
        });

        it('displays loading state while FFmpeg loads', async () => {
            render(<AudioProcessor />);
            // Should show loading indicator initially
            expect(screen.getByText('loadingCore')).toBeInTheDocument();
            // Wait for it to settle to avoid act warnings
            await waitFor(() => {
                expect(screen.getByText('step1Title')).toBeInTheDocument();
            });
        });
    });

    describe('FFmpeg Loading', () => {
        it('shows step indicator after FFmpeg loads', async () => {
            render(<AudioProcessor />);

            await waitFor(() => {
                // After loading, step1Title should be visible
                expect(screen.getByText('step1Title')).toBeInTheDocument();
            });
        });
    });

    describe('Step 1: Mode Selection', () => {
        it('displays mode selection options after loading', async () => {
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('step1Heading')).toBeInTheDocument();
                expect(screen.getByText('concatMode')).toBeInTheDocument();
                expect(screen.getByText('trimMode')).toBeInTheDocument();
            });
        });

        it('enables next button only when mode is selected', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('nextButton')).toBeInTheDocument();
            });

            // Next button should be disabled initially
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            expect(nextButton).toBeDisabled();

            // Click on concat mode
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            // Next button should now be enabled
            expect(nextButton).not.toBeDisabled();
        });

        it('allows selecting different modes', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Select trim mode
            const trimButton = screen.getByText('trimMode').closest('button');
            if (trimButton) {
                await user.click(trimButton);
                // Re-query to get updated button after state change
                await waitFor(() => {
                    const updatedTrimButton = screen.getByText('trimMode').closest('button');
                    expect(updatedTrimButton).toHaveClass('border-primary');
                });
            }


        });
    });

    describe('Navigation', () => {
        it('navigates to step 2 when next is clicked', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Select a mode
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            // Click next
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            // Should show step 2
            await waitFor(() => {
                expect(screen.getByText('step2Heading')).toBeInTheDocument();
            });
        });

        it('navigates back to step 1 when prev is clicked', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Select a mode and go to step 2
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('step2Heading')).toBeInTheDocument();
            });

            // Click back
            const prevButton = screen.getByRole('button', { name: /prevButton/i });
            await user.click(prevButton);

            // Should show step 1
            await waitFor(() => {
                expect(screen.getByText('step1Heading')).toBeInTheDocument();
            });
        });
    });

    describe('Step 2: Configuration', () => {
        it('shows concat settings when concat mode is selected', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Select concat mode
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            // Go to step 2
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('concatenationSection')).toBeInTheDocument();
                expect(screen.getByText('introFileLabel')).toBeInTheDocument();
                expect(screen.getByText('outroFileLabel')).toBeInTheDocument();
            });
        });

        it('shows trim settings when trim mode is selected', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('trimMode')).toBeInTheDocument();
            });

            // Select trim mode
            const trimButton = screen.getByText('trimMode').closest('button');
            if (trimButton) {
                await user.click(trimButton);
            }

            // Go to step 2
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('trimSection')).toBeInTheDocument();
                expect(screen.getByText('startTimeLabel')).toBeInTheDocument();
                expect(screen.getByText('durationLabel')).toBeInTheDocument();
            });
        });

        it('shows trim mode selection radio buttons', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('trimMode')).toBeInTheDocument();
            });

            // Select trim mode
            const trimButton = screen.getByText('trimMode').closest('button');
            if (trimButton) {
                await user.click(trimButton);
            }

            // Go to step 2
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('trimModeLabel')).toBeInTheDocument();
                expect(screen.getByText('trimModeStartDuration')).toBeInTheDocument();
                expect(screen.getByText('trimModeDurationEnd')).toBeInTheDocument();
            });
        });

        it('shows different fields based on trim mode selection', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('trimMode')).toBeInTheDocument();
            });

            // Select trim mode and go to step 2
            const trimButton = screen.getByText('trimMode').closest('button');
            if (trimButton) {
                await user.click(trimButton);
            }
            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton);

            await waitFor(() => {
                expect(screen.getByText('trimModeLabel')).toBeInTheDocument();
            });

            // Start+Duration mode is default, should show startTimeLabel
            expect(screen.getByText('startTimeLabel')).toBeInTheDocument();

            // Switch to Duration+End mode
            const durationEndRadio = screen.getByText('trimModeDurationEnd').closest('label')?.querySelector('input');
            if (durationEndRadio) {
                await user.click(durationEndRadio);
            }

            // Should now show endTimeLabel instead of startTimeLabel
            await waitFor(() => {
                expect(screen.getByText('endTimeLabel')).toBeInTheDocument();
                expect(screen.getByText('durationFromEndLabel')).toBeInTheDocument();
            });
        });


    });

    describe('Step 3: File Selection', () => {
        it('shows file upload area', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Navigate to step 3
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton); // to step 2

            await waitFor(() => {
                expect(screen.getByText('step2Heading')).toBeInTheDocument();
            });

            await user.click(nextButton); // to step 3

            await waitFor(() => {
                expect(screen.getByText('step3Heading')).toBeInTheDocument();
                expect(screen.getByText('dropzoneText')).toBeInTheDocument();
            });
        });

        it('disables process button when no files selected', async () => {
            const user = userEvent.setup();
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('concatMode')).toBeInTheDocument();
            });

            // Navigate to step 3
            const concatButton = screen.getByText('concatMode').closest('button');
            if (concatButton) {
                await user.click(concatButton);
            }

            const nextButton = screen.getByRole('button', { name: /nextButton/i });
            await user.click(nextButton); // to step 2

            await waitFor(() => {
                expect(screen.getByText('step2Heading')).toBeInTheDocument();
            });

            await user.click(nextButton); // to step 3

            await waitFor(() => {
                expect(screen.getByText('step3Heading')).toBeInTheDocument();
            });

            // Process button should be disabled
            const processButton = screen.getByRole('button', { name: /processButton/i });
            expect(processButton).toBeDisabled();
        });
    });

    describe('StepIndicator', () => {
        it('shows all step titles', async () => {
            render(<AudioProcessor />);

            await waitFor(() => {
                expect(screen.getByText('step1Title')).toBeInTheDocument();
                expect(screen.getByText('step2Title')).toBeInTheDocument();
                expect(screen.getByText('step3Title')).toBeInTheDocument();
                expect(screen.getByText('step4Title')).toBeInTheDocument();
                expect(screen.getByText('step5Title')).toBeInTheDocument();
            });
        });
    });
});
