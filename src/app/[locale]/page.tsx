import dynamic from 'next/dynamic';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const AudioProcessor = dynamic(() => import('@/components/AudioProcessor'), { ssr: false });

export default async function Home() {

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-background relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
            </div>
            <div className="w-full max-w-5xl mx-auto">
                <AudioProcessor />
            </div>
        </main>
    )
}

