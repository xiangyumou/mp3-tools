import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
// import { cva, type VariantProps } from "class-variance-authority" - Removed unused import

// Simplified Button
import { cn } from "@/lib/utils"

const buttonVariants = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        let variantClass = "bg-primary text-primary-foreground hover:bg-primary/90"
        if (variant === "destructive") variantClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        if (variant === "outline") variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        if (variant === "secondary") variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        if (variant === "ghost") variantClass = "hover:bg-accent hover:text-accent-foreground"
        if (variant === "link") variantClass = "text-primary underline-offset-4 hover:underline"

        let sizeClass = "h-10 px-4 py-2"
        if (size === "sm") sizeClass = "h-9 rounded-md px-3"
        if (size === "lg") sizeClass = "h-11 rounded-md px-8"
        if (size === "icon") sizeClass = "h-10 w-10"

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


// Simplified Input
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

// Simplified Card
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
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
        <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
CardTitle.displayName = "CardTitle"


// Simplified Progress
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
    ({ className, value, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
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
