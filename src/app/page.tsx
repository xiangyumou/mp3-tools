import dynamic from 'next/dynamic';

const AudioProcessor = dynamic(() => import('@/components/AudioProcessor'), { ssr: false });


export default function Home() {
    return (
        <main className="min-h-screen p-8 md:p-24 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Local Audio Batch Processor</h1>
                    <p className="text-muted-foreground">
                        Process your audio files entirely in your browser using FFmpeg WASM. No uploads, secure and fast.
                    </p>
                </div>

                <AudioProcessor />
            </div>
        </main>
    )
}
