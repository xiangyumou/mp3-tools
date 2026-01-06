import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const AudioProcessor = dynamic(() => import('@/components/AudioProcessor'), { ssr: false });

export default function Home() {
    const t = useTranslations('AudioProcessor');

    return (
        <main className="min-h-screen p-8 md:p-24 bg-background relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
            </div>
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">{t('title')}</h1>
                    <p className="text-muted text-sm">
                        {t('description')}
                    </p>
                </div>

                <AudioProcessor />
            </div>
        </main>
    )
}
