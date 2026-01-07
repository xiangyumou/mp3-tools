import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Progress,
    StepIndicator,
} from './simple-ui';

describe('Button Component', () => {
    describe('variants', () => {
        it('renders default variant correctly', () => {
            render(<Button>Click me</Button>);
            const button = screen.getByRole('button', { name: 'Click me' });
            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('bg-primary');
        });

        it('renders destructive variant correctly', () => {
            render(<Button variant="destructive">Delete</Button>);
            const button = screen.getByRole('button', { name: 'Delete' });
            expect(button).toHaveClass('bg-destructive');
        });

        it('renders outline variant correctly', () => {
            render(<Button variant="outline">Outline</Button>);
            const button = screen.getByRole('button', { name: 'Outline' });
            expect(button).toHaveClass('border');
            expect(button).toHaveClass('bg-background');
        });

        it('renders secondary variant correctly', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button', { name: 'Secondary' });
            expect(button).toHaveClass('bg-secondary');
        });

        it('renders ghost variant correctly', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button', { name: 'Ghost' });
            expect(button).toHaveClass('hover:bg-accent');
        });

        it('renders link variant correctly', () => {
            render(<Button variant="link">Link</Button>);
            const button = screen.getByRole('button', { name: 'Link' });
            expect(button).toHaveClass('text-primary');
            expect(button).toHaveClass('underline-offset-4');
        });
    });

    describe('sizes', () => {
        // Note: Components now use responsive sizing (mobile-first)
        // Mobile: h-12 (48px), Desktop: sm:h-9 (36px)
        it('renders default size correctly', () => {
            render(<Button size="default">Default</Button>);
            const button = screen.getByRole('button', { name: 'Default' });
            // Mobile-first: h-12 is the base, sm:h-9 for desktop
            expect(button).toHaveClass('h-12');
            expect(button).toHaveClass('sm:h-9');
        });

        it('renders small size correctly', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button', { name: 'Small' });
            // Mobile: h-10, Desktop: sm:h-8
            expect(button).toHaveClass('h-10');
            expect(button).toHaveClass('sm:h-8');
        });

        it('renders large size correctly', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button', { name: 'Large' });
            // Mobile: h-12, Desktop: sm:h-10
            expect(button).toHaveClass('h-12');
            expect(button).toHaveClass('sm:h-10');
        });

        it('renders icon size correctly', () => {
            render(<Button size="icon">Icon</Button>);
            const button = screen.getByRole('button', { name: 'Icon' });
            // Mobile: h-12 w-12, Desktop: sm:h-9 sm:w-9
            expect(button).toHaveClass('h-12');
            expect(button).toHaveClass('w-12');
            expect(button).toHaveClass('sm:h-9');
            expect(button).toHaveClass('sm:w-9');
        });
    });

    describe('states', () => {
        it('renders disabled state correctly', () => {
            render(<Button disabled>Disabled</Button>);
            const button = screen.getByRole('button', { name: 'Disabled' });
            expect(button).toBeDisabled();
            expect(button).toHaveClass('disabled:opacity-50');
        });

        it('handles click events', async () => {
            const user = userEvent.setup();
            let clicked = false;
            render(<Button onClick={() => (clicked = true)}>Click</Button>);
            const button = screen.getByRole('button', { name: 'Click' });
            await user.click(button);
            expect(clicked).toBe(true);
        });

        it('does not fire click when disabled', async () => {
            const user = userEvent.setup();
            let clicked = false;
            render(
                <Button disabled onClick={() => (clicked = true)}>
                    Click
                </Button>
            );
            const button = screen.getByRole('button', { name: 'Click' });
            await user.click(button);
            expect(clicked).toBe(false);
        });
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole('button', { name: 'Custom' });
        expect(button).toHaveClass('custom-class');
    });
});

describe('Input Component', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
    });

    it('applies correct base styles', () => {
        render(<Input data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        // Mobile-first: h-12 base, sm:h-9 for desktop
        expect(input).toHaveClass('flex', 'h-12', 'w-full', 'rounded-md');
        expect(input).toHaveClass('sm:h-9');
    });

    it('handles disabled state', () => {
        render(<Input disabled data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('handles input changes', async () => {
        const user = userEvent.setup();
        render(<Input data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        await user.type(input, 'Hello');
        expect(input).toHaveValue('Hello');
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        expect(input).toHaveClass('custom-class');
    });

    it('renders with different types', () => {
        render(<Input type="password" data-testid="test-input" />);
        const input = screen.getByTestId('test-input');
        expect(input).toHaveAttribute('type', 'password');
    });
});

describe('Card Components', () => {
    it('renders Card correctly', () => {
        render(<Card data-testid="card">Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toBeInTheDocument();
        expect(card).toHaveClass('rounded-xl', 'border', 'bg-card');
    });

    it('renders CardHeader correctly', () => {
        render(<CardHeader data-testid="header">Header</CardHeader>);
        const header = screen.getByTestId('header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveClass('flex', 'flex-col', 'p-6');
    });

    it('renders CardTitle correctly', () => {
        render(<CardTitle>Title</CardTitle>);
        const title = screen.getByRole('heading', { name: 'Title' });
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('font-semibold');
    });

    it('renders CardContent correctly', () => {
        render(<CardContent data-testid="content">Content</CardContent>);
        const content = screen.getByTestId('content');
        expect(content).toBeInTheDocument();
        expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('renders complete Card structure', () => {
        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Test Title</CardTitle>
                </CardHeader>
                <CardContent>Test Content</CardContent>
            </Card>
        );
        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
});

describe('Progress Component', () => {
    it('renders correctly', () => {
        render(<Progress value={50} data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        expect(progress).toBeInTheDocument();
    });

    it('applies correct base styles', () => {
        render(<Progress value={50} data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        expect(progress).toHaveClass('relative', 'h-2', 'w-full', 'rounded-full');
    });

    it('renders at 0% correctly', () => {
        render(<Progress value={0} data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        const indicator = progress.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });

    it('renders at 50% correctly', () => {
        render(<Progress value={50} data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        const indicator = progress.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ transform: 'translateX(-50%)' });
    });

    it('renders at 100% correctly', () => {
        render(<Progress value={100} data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        const indicator = progress.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ transform: 'translateX(-0%)' });
    });

    it('handles undefined value', () => {
        render(<Progress data-testid="progress" />);
        const progress = screen.getByTestId('progress');
        const indicator = progress.firstChild as HTMLElement;
        expect(indicator).toHaveStyle({ transform: 'translateX(-100%)' });
    });
});

describe('StepIndicator Component', () => {
    const steps = [
        { id: 1, title: 'Step 1' },
        { id: 2, title: 'Step 2' },
        { id: 3, title: 'Step 3' },
    ];

    it('renders all steps', () => {
        render(<StepIndicator steps={steps} currentStep={1} />);
        expect(screen.getByText('Step 1')).toBeInTheDocument();
        expect(screen.getByText('Step 2')).toBeInTheDocument();
        expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('highlights current step', () => {
        render(<StepIndicator steps={steps} currentStep={2} />);
        const step2Label = screen.getByText('Step 2');
        expect(step2Label).toHaveClass('text-primary');
    });

    it('shows completed steps with checkmark', () => {
        render(<StepIndicator steps={steps} currentStep={3} />);
        // Steps 1 and 2 should be completed (show checkmark)
        const svgElements = document.querySelectorAll('svg');
        expect(svgElements.length).toBeGreaterThanOrEqual(2);
    });

    it('shows step numbers for incomplete steps', () => {
        render(<StepIndicator steps={steps} currentStep={1} />);
        // Step 2 and 3 should show numbers
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders connector lines between steps', () => {
        const { container } = render(<StepIndicator steps={steps} currentStep={2} />);
        // Should have 2 connector lines for 3 steps
        // Mobile: w-6, Desktop: sm:w-12
        const connectors = container.querySelectorAll('.w-6.h-0\\.5');
        expect(connectors.length).toBe(2);
    });

    it('applies custom className', () => {
        render(<StepIndicator steps={steps} currentStep={1} className="custom-class" />);
        const container = document.querySelector('.custom-class');
        expect(container).toBeInTheDocument();
    });
});
