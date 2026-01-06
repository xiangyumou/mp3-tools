import dynamic from 'next/dynamic';

const AudioProcessor = dynamic(() => import('@/components/AudioProcessor'), { ssr: false });


export default function Home() {
    return (
        <main className="min-h-screen p-8 md:p-24 bg-background">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Local Audio Batch Processor</h1>
                    <p className="text-muted text-sm">
                        Process your audio files entirely in your browser using FFmpeg WASM. No uploads, secure and fast.
                    </p>
                </div>

                <AudioProcessor />
            </div>
        </main>
    )
}
