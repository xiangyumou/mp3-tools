import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// --- Button ---
// SOP: 5.1 Button
// Variants: default, secondary, ghost, outline, destructive, link
// Sizes: sm (32px), default (36px), lg (40px), icon variants

// SOP: 5.1 Button - Mobile touch target ≥ 48px
const buttonVariants = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        let variantClass = ""
        if (variant === "default") variantClass = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" // Added shadow-sm for default generic feel if needed, but SOP says border/shadow priority. Primary usually flat or subtle. SOP: bg-primary text-white
        if (variant === "destructive") variantClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
        if (variant === "outline") variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        if (variant === "secondary") variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        if (variant === "ghost") variantClass = "hover:bg-accent hover:text-accent-foreground"
        if (variant === "link") variantClass = "text-primary underline-offset-4 hover:underline"

        let sizeClass = ""
        // SOP: Mobile touch targets ≥ 48px (h-12), desktop can use smaller sizes
        if (size === "default") sizeClass = "h-12 sm:h-9 px-4 py-2" // Mobile: 48px, Desktop: 36px
        if (size === "sm") sizeClass = "h-10 sm:h-8 rounded-md px-3" // Mobile: 40px, Desktop: 32px
        if (size === "lg") sizeClass = "h-12 sm:h-10 rounded-md px-8" // Mobile: 48px, Desktop: 40px
        if (size === "icon") sizeClass = "h-12 w-12 sm:h-9 sm:w-9" // Mobile: 48px, Desktop: 36px

        return (
            <Comp
                className={cn(buttonVariants, variantClass, sizeClass, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"


// --- Input ---
// SOP: 5.2 Input
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // SOP: 4.3 Mobile Constraints - font-size 16px to prevent iOS auto-zoom
                    // SOP: Mobile touch target h-12 (48px)
                    "flex h-12 sm:h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base sm:text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 file:mr-4 file:py-0 file:px-2 file:rounded-sm file:border file:border-input file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

// --- Card ---
// SOP: 5.3 Card
// bg surface, border border, radius xl (12px), optional shadow-sm
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} {...props} />
    )
)
Card.displayName = "Card"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    )
)
CardContent.displayName = "CardContent"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
    )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
CardTitle.displayName = "CardTitle"


// --- Progress ---
// SOP: 3.4 Spacing / Components
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
    ({ className, value, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
            {...props}
        >
            <div
                className="h-full w-full flex-1 bg-primary transition-all"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </div>
    )
)
Progress.displayName = "Progress"

// --- StepIndicator ---
// Wizard progress indicator component
export interface Step {
    id: number
    title: string
}

export interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
    className?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, className }) => {
    return (
        <div className={cn("flex items-center justify-center w-full mb-8", className)}>
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep
                const isCurrent = step.id === currentStep
                const isLast = index === steps.length - 1

                return (
                    <div key={step.id} className="flex items-center">
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    // SOP: Mobile touch target ≥ 48px
                                    "w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                                    isCompleted && "bg-primary border-primary text-primary-foreground",
                                    isCurrent && "border-primary text-primary bg-transparent",
                                    !isCompleted && !isCurrent && "border-muted text-muted bg-transparent"
                                )}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.id
                                )}
                            </div>
                            {/* SOP: Hide text on mobile to prevent crowding */}
                            <span
                                className={cn(
                                    "mt-2 text-xs font-medium max-w-[80px] text-center hidden sm:block",
                                    isCurrent ? "text-primary" : "text-muted"
                                )}
                            >
                                {step.title}
                            </span>
                        </div>

                        {/* Connector line - shorter on mobile */}
                        {!isLast && (
                            <div
                                className={cn(
                                    "w-6 sm:w-12 h-0.5 mx-1 sm:mx-2 mb-0 sm:mb-6",
                                    isCompleted ? "bg-primary" : "bg-border"
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
StepIndicator.displayName = "StepIndicator"

// --- Checkbox ---
// SOP: Custom minimal checkbox following design tokens
export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => (
        <input
            type="checkbox"
            className={cn(
                "h-4 w-4 shrink-0 rounded border border-input ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "accent-primary cursor-pointer",
                className
            )}
            ref={ref}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            {...props}
        />
    )
);
Checkbox.displayName = "Checkbox";

export { Button, Input, Card, CardContent, CardHeader, CardTitle, Progress, StepIndicator, Checkbox }
