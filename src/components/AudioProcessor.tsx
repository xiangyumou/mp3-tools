'use client';

import { useTranslations } from 'next-intl';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui/simple-ui';
import { cn } from '@/lib/utils';
import { Loader2, Upload, Download, FileAudio, Play } from 'lucide-react';

export default function AudioProcessor() {
    const t = useTranslations('AudioProcessor');
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement | null>(null);
    const [log, setLog] = useState<string>('');

    // State
    const [files, setFiles] = useState<File[]>([]);
    const [introFile, setIntroFile] = useState<File | null>(null);
    const [outroFile, setOutroFile] = useState<File | null>(null);
    const [trimStart, setTrimStart] = useState<string>('0');
    const [trimDuration, setTrimDuration] = useState<string>('');
    const [mode, setMode] = useState<'concat' | 'trim' | 'both'>('concat');
    const [progress, setProgress] = useState<number>(0);
    const [processedFiles, setProcessedFiles] = useState<{ name: string, url: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setIsLoading(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        // Ideally these are self-hosted for offline capability, but using CDN for feasibility check first
        // Note: To be fully offline, we should copy these files to public/ffmpeg-core/
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({ message }) => {
            if (messageRef.current) messageRef.current.innerHTML = message;
            // setLog(prev => prev + '\n' + message); // Performance hit if too much logging
        });

        ffmpeg.on('progress', ({ progress }) => {
            // progress is 0-1
            // But this is per command. For batch, we manage global progress manually or per-file.
            // We'll trust our manual tracking for file count progress.
        });

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        } catch (e) {
            console.error("Failed to load ffmpeg", e);
            setLog(t('failedLoad'));
        }
        setIsLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const processFiles = async () => {
        if (!loaded) return;
        setIsProcessing(true);
        setProgress(0);
        setProcessedFiles([]);
        const ffmpeg = ffmpegRef.current;

        const results = [];
        const total = files.length;

        // Write common resources once if possible, or per loop
        if (introFile) await ffmpeg.writeFile('intro.mp3', await fetchFile(introFile));
        if (outroFile) await ffmpeg.writeFile('outro.mp3', await fetchFile(outroFile));

        for (let i = 0; i < total; i++) {
            const file = files[i];
            const inputName = `input_${i}.mp3`;
            const outputName = `output_${i}.mp3`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            let currentInput = inputName;
            let commandArgs: string[] = [];

            // TRIM FIRST if enabled (logic choice: trim then concat usually)
            if (mode === 'trim' || mode === 'both') {
                const trimmedName = `trimmed_${i}.mp3`;
                const ss = trimStart || '0';
                const t = trimDuration; // optional

                const args = ['-i', currentInput, '-ss', ss];
                if (t) args.push('-t', t);
                args.push('-c', 'copy', trimmedName);

                await ffmpeg.exec(args);
                // Cleanup intermediate
                if (currentInput !== inputName) await ffmpeg.deleteFile(currentInput);
                currentInput = trimmedName;
            }

            // CONCAT
            if (mode === 'concat' || mode === 'both') {
                // Concat protocol or filter_complex? 
                // Concat protocol is safer for same codec. 
                // We'll generate a file list.
                const listName = `list_${i}.txt`;
                let fileList = '';

                if (introFile) fileList += `file 'intro.mp3'\n`;
                fileList += `file '${currentInput}'\n`;
                if (outroFile) fileList += `file 'outro.mp3'\n`;

                await ffmpeg.writeFile(listName, fileList);

                // safer approach for mp3 concat: -f concat -safe 0 -i list.txt -c copy
                await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', listName, '-c', 'copy', outputName]);

                await ffmpeg.deleteFile(listName);
                if (currentInput !== inputName && currentInput !== `trimmed_${i}.mp3`) await ffmpeg.deleteFile(currentInput); // cleanup 
            } else {
                // If only trim, we need to rename currentInput to outputName if it's not already
                if (currentInput !== outputName) {
                    await ffmpeg.exec(['-i', currentInput, '-c', 'copy', outputName]);
                }
            }

            // Read result
            const data = await ffmpeg.readFile(outputName);
            const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: 'audio/mp3' }));
            results.push({ name: `processed_${file.name}`, url });

            // Cleanup file-specific inputs
            await ffmpeg.deleteFile(inputName);
            try { await ffmpeg.deleteFile(outputName); } catch { }
            try { if (currentInput.startsWith('trimmed')) await ffmpeg.deleteFile(currentInput); } catch { }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        setProcessedFiles(results);
        setIsProcessing(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileAudio className="w-6 h-6" />
                        {t('cardTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!loaded && (
                        <div className="flex items-center gap-2 text-warning bg-surface2 border border-warning/20 p-4 rounded-md text-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            <span>{isLoading ? t('loadingCore') : t('coreNotLoaded')}</span>
                        </div>
                    )}

                    {/* Mode Selection */}
                    <div className="flex gap-4">
                        <Button variant={mode === 'concat' ? 'default' : 'outline'} onClick={() => setMode('concat')}>{t('concatMode')}</Button>
                        <Button variant={mode === 'trim' ? 'default' : 'outline'} onClick={() => setMode('trim')}>{t('trimMode')}</Button>
                        <Button variant={mode === 'both' ? 'default' : 'outline'} onClick={() => setMode('both')}>{t('bothMode')}</Button>
                    </div>

                    {/* Configuration */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {(mode === 'concat' || mode === 'both') && (
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-medium">{t('concatenationSection')}</h3>
                                <div>
                                    <label className="text-sm font-medium">{t('introFileLabel')}</label>
                                    <Input type="file" accept="audio/*" onChange={(e) => setIntroFile(e.target.files?.[0] || null)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{t('outroFileLabel')}</label>
                                    <Input type="file" accept="audio/*" onChange={(e) => setOutroFile(e.target.files?.[0] || null)} />
                                </div>
                            </div>
                        )}

                        {(mode === 'trim' || mode === 'both') && (
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="font-medium">{t('trimSection')}</h3>
                                <div>
                                    <label className="text-sm font-medium">{t('startTimeLabel')}</label>
                                    <Input type="text" placeholder="0" value={trimStart} onChange={(e) => setTrimStart(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{t('durationLabel')}</label>
                                    <Input type="text" placeholder={t('durationPlaceholder')} value={trimDuration} onChange={(e) => setTrimDuration(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Files */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('targetFilesLabel')}</label>
                        <div className="flex gap-2">
                            <Input type="file" multiple accept="audio/*" onChange={handleFileChange} className="cursor-pointer" />
                            <Button disabled={!loaded || files.length === 0 || isProcessing} onClick={processFiles}>
                                {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 w-4 h-4" />}
                                {t('processButton')} {files.length > 0 && `(${files.length})`}
                            </Button>
                        </div>
                    </div>

                    {/* Progress */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{t('processing')}</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    )}

                    {/* Logs */}
                    <div className="text-xs text-muted font-mono h-24 overflow-y-auto bg-surface2 p-2 rounded-lg border">
                        <p ref={messageRef}>{t('logsPlaceholder')}</p>
                    </div>

                    {/* Output */}
                    {processedFiles.length > 0 && (
                        <div className="space-y-2 mt-4 pt-4 border-t">
                            <h3 className="font-medium">{t('processedFilesTitle')}</h3>
                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                                {processedFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-surface2 p-2 rounded-lg border">
                                        <span className="text-sm truncate max-w-[300px] text-text">{f.name}</span>
                                        <div className="flex gap-2">
                                            <audio controls src={f.url} className="h-8" />
                                            <a href={f.url} download={f.name}>
                                                <Button size="sm" variant="outline"><Download className="w-4 h-4" /></Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
