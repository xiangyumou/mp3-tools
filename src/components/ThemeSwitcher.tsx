"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/simple-ui"

export default function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const t = useTranslations("ThemeSwitcher")
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const cycleTheme = () => {
        const themes = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme || 'system');
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-4 h-4" />;
            case 'dark':
                return <Moon className="w-4 h-4" />;
            case 'system':
            default:
                return <Monitor className="w-4 h-4" />;
        }
    };

    const getLabel = () => {
        switch (theme) {
            case 'light':
                return t('light');
            case 'dark':
                return t('dark');
            case 'system':
            default:
                return t('system');
        }
    };

    return (
        <Button variant="ghost" size="sm" onClick={cycleTheme} className="gap-2">
            {getIcon()}
            <span className="hidden sm:inline">{getLabel()}</span>
        </Button>
    )
}
