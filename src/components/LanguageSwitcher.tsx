'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/simple-ui';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const nextLocale = locale === 'en' ? 'zh' : 'en';
        // Replace the locale segment in the pathname
        // The pathname usually looks like /en/some/path or /en
        const segments = pathname.split('/');
        segments[1] = nextLocale;
        const nextPath = segments.join('/');

        router.push(nextPath);
    };

    return (
        <Button variant="ghost" size="sm" onClick={toggleLocale} className="gap-2">
            <Globe className="w-4 h-4" />
            {locale === 'en' ? 'English' : '中文'}
        </Button>
    );
}
