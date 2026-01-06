import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// --- Button ---
// SOP: 5.1 Button
// Variants: default, secondary, ghost, outline, destructive, link
// Sizes: sm (32px), default (36px), lg (40px), icon variants

const buttonVariants = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-99"

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
        if (size === "default") sizeClass = "h-9 px-4 py-2" // SOP: 36px
        if (size === "sm") sizeClass = "h-8 rounded-md px-3" // SOP: 32px
        if (size === "lg") sizeClass = "h-10 rounded-md px-8" // SOP: 40px
        if (size === "icon") sizeClass = "h-9 w-9" // SOP: 36px

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
                    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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

export { Button, Input, Card, CardContent, CardHeader, CardTitle, Progress }
