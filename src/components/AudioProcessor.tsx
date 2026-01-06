'use client';

import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect, useMemo } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Progress, StepIndicator, Step } from '@/components/ui/simple-ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Download, FileAudio, Play, ChevronLeft, ChevronRight, RotateCcw, Upload, Scissors, Music } from 'lucide-react';

type Mode = 'concat' | 'trim';



const ModeCard = ({
    modeType,
    icon: Icon,
    title,
    description,
    currentMode,
    onSelect
}: {
    modeType: Mode,
    icon: React.ElementType,
    title: string,
    description: string,
    currentMode: Mode | null,
    onSelect: (m: Mode) => void
}) => (
    <button
        onClick={() => onSelect(modeType)}
        className={cn(
            "flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:border-primary/50 text-left w-full",
            currentMode === modeType ? "border-primary bg-primary/5" : "border-border bg-surface"
        )}
    >
        <Icon className={cn("w-10 h-10 mb-4", currentMode === modeType ? "text-primary" : "text-muted")} />
        <h3 className="font-medium text-text mb-1">{title}</h3>
        <p className="text-sm text-muted text-center">{description}</p>
    </button>
);

export default function AudioProcessor() {
    const t = useTranslations('AudioProcessor');

    // FFmpeg state
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);

    // Configuration state
    const [files, setFiles] = useState<File[]>([]);
    const [introFile, setIntroFile] = useState<File | null>(null);
    const [outroFile, setOutroFile] = useState<File | null>(null);
    const [trimStart, setTrimStart] = useState<string>('0');
    const [trimDuration, setTrimDuration] = useState<string>('');
    const [mode, setMode] = useState<Mode | null>(null);

    // Processing state
    const [progress, setProgress] = useState<number>(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [processedFiles, setProcessedFiles] = useState<{ name: string, url: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const steps: Step[] = useMemo(() => [
        { id: 1, title: t('step1Title') },
        { id: 2, title: t('step2Title') },
        { id: 3, title: t('step3Title') },
        { id: 4, title: t('step4Title') },
        { id: 5, title: t('step5Title') },
    ], [t]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const ffmpeg = ffmpegRef.current;

            ffmpeg.on('log', ({ message }) => {
                if (messageRef.current) messageRef.current.innerHTML = message;
            });

            try {
                // Load from local public directory
                const baseURL = window.location.origin + '/ffmpeg';
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                });
                setLoaded(true);
            } catch (e) {
                console.error("Failed to load ffmpeg", e);
                toast.error(t('failedLoad'));
            }
            setIsLoading(false);
        };

        load();
    }, [t]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1: return mode !== null;
            case 2:
                // Validation for trim mode
                if (mode === 'trim') {
                    // It's technically valid to have empty duration (rest of file), 
                    // but at least one field should probably be touched or it's just a copy.
                    // For now, adhere to permissive loose, but check files if needed?
                    // Actually, let's keep it permissive as requested ("is everything filled out that NEEDS to be").
                    // A user CAN leave things empty for default behavior.
                    return true;
                }
                return true;
            case 3: return files.length > 0;
            default: return true;
        }
    };

    const goNext = () => {
        if (currentStep === 3) {
            // Start processing
            processFiles();
        } else if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const startOver = () => {
        setCurrentStep(1);
        setMode(null);
        setFiles([]);
        setIntroFile(null);
        setOutroFile(null);
        setTrimStart('0');
        setTrimDuration('');
        setProgress(0);
        setProcessedFiles([]);
        setCurrentFileIndex(0);
    };

    const processFiles = async () => {
        if (!loaded || !mode) return;
        setCurrentStep(4);
        setIsProcessing(true);
        setProgress(0);
        setProcessedFiles([]);
        const ffmpeg = ffmpegRef.current;

        const results: { name: string, url: string }[] = [];
        const total = files.length;

        if (introFile) await ffmpeg.writeFile('intro.mp3', await fetchFile(introFile));
        if (outroFile) await ffmpeg.writeFile('outro.mp3', await fetchFile(outroFile));

        for (let i = 0; i < total; i++) {
            setCurrentFileIndex(i + 1);
            const file = files[i];
            const inputName = `input_${i}.mp3`;
            const outputName = `output_${i}.mp3`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            let currentInput = inputName;

            // TRIM FIRST if enabled
            if (mode === 'trim') {
                const trimmedName = `trimmed_${i}.mp3`;
                const ss = trimStart || '0';
                const dur = trimDuration;

                const args = ['-i', currentInput, '-ss', ss];
                if (dur) args.push('-t', dur);
                args.push('-c', 'copy', trimmedName);

                await ffmpeg.exec(args);
                if (currentInput !== inputName) await ffmpeg.deleteFile(currentInput);
                currentInput = trimmedName;
            }

            // CONCAT
            if (mode === 'concat') {
                const listName = `list_${i}.txt`;
                let fileList = '';

                if (introFile) fileList += `file 'intro.mp3'\n`;
                fileList += `file '${currentInput}'\n`;
                if (outroFile) fileList += `file 'outro.mp3'\n`;

                await ffmpeg.writeFile(listName, fileList);
                await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', listName, '-c', 'copy', outputName]);

                await ffmpeg.deleteFile(listName);
                if (currentInput !== inputName && currentInput !== `trimmed_${i}.mp3`) await ffmpeg.deleteFile(currentInput);
            } else {
                if (currentInput !== outputName) {
                    await ffmpeg.exec(['-i', currentInput, '-c', 'copy', outputName]);
                }
            }

            const data = await ffmpeg.readFile(outputName);
            const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: 'audio/mp3' }));
            results.push({ name: `processed_${file.name}`, url });

            await ffmpeg.deleteFile(inputName);
            try { await ffmpeg.deleteFile(outputName); } catch { /* Ignore cleanup errors */ }
            try { if (currentInput.startsWith('trimmed')) await ffmpeg.deleteFile(currentInput); } catch { /* Ignore cleanup errors */ }

            setProgress(Math.round(((i + 1) / total) * 100));
        }

        setProcessedFiles(results);
        setIsProcessing(false);
        setCurrentStep(5);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold mb-2">{t('step1Heading')}</h2>
                            <p className="text-muted text-sm">{t('step1Description')}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <ModeCard
                                modeType="concat"
                                icon={Music}
                                title={t('concatMode')}
                                description={t('concatModeDesc')}
                                currentMode={mode}
                                onSelect={setMode}
                            />
                            <ModeCard
                                modeType="trim"
                                icon={Scissors}
                                title={t('trimMode')}
                                description={t('trimModeDesc')}
                                currentMode={mode}
                                onSelect={setMode}
                            />

                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold mb-2">{t('step2Heading')}</h2>
                        </div>
                        <div className="max-w-lg mx-auto space-y-6">
                            {(mode === 'concat') && (
                                <div className="space-y-4 p-4 rounded-lg border bg-surface">
                                    <h3 className="font-medium">{t('concatenationSection')}</h3>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('introFileLabel')}</label>
                                        <Input type="file" accept="audio/*" onChange={(e) => setIntroFile(e.target.files?.[0] || null)} />
                                        <p className="text-xs text-muted">{t('introFileHint')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('outroFileLabel')}</label>
                                        <Input type="file" accept="audio/*" onChange={(e) => setOutroFile(e.target.files?.[0] || null)} />
                                        <p className="text-xs text-muted">{t('outroFileHint')}</p>
                                    </div>
                                </div>
                            )}

                            {(mode === 'trim') && (
                                <div className="space-y-4 p-4 rounded-lg border bg-surface">
                                    <h3 className="font-medium">{t('trimSection')}</h3>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('startTimeLabel')}</label>
                                        <Input type="text" placeholder="0" value={trimStart} onChange={(e) => setTrimStart(e.target.value)} />
                                        <p className="text-xs text-muted">{t('startTimeHint')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('durationLabel')}</label>
                                        <Input type="text" placeholder={t('durationPlaceholder')} value={trimDuration} onChange={(e) => setTrimDuration(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold mb-2">{t('step3Heading')}</h2>
                            <p className="text-muted text-sm">{t('step3Description')}</p>
                        </div>
                        <div className="max-w-lg mx-auto">
                            <label
                                htmlFor="file-upload"
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                                    files.length > 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-surface"
                                )}
                            >
                                <Upload className={cn("w-10 h-10 mb-4", files.length > 0 ? "text-primary" : "text-muted")} />
                                {files.length > 0 ? (
                                    <span className="text-primary font-medium">{t('filesSelected', { count: files.length })}</span>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-muted">{t('dropzoneText')}</span>
                                        <Button type="button" variant="secondary" size="sm">{t('selectFileButton')}</Button>
                                    </div>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept="audio/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {files.length > 0 && (
                                <div className="mt-4 max-h-40 overflow-y-auto space-y-1">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-muted p-2 bg-surface2 rounded">
                                            <FileAudio className="w-4 h-4" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold mb-2">{t('step4Heading')}</h2>
                            <p className="text-muted text-sm">{t('processingFile', { current: currentFileIndex, total: files.length })}</p>
                        </div>
                        <div className="max-w-lg mx-auto space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>{t('step4Title')}</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                            <div className="text-xs text-muted font-mono h-24 overflow-y-auto bg-surface2 p-2 rounded-lg border">
                                <p ref={messageRef}>{t('logsPlaceholder')}</p>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold mb-2">{t('step5Heading')}</h2>
                            <p className="text-muted text-sm">{t('step5Description')}</p>
                        </div>
                        <div className="max-w-2xl mx-auto">
                            <div className="grid gap-2 max-h-60 overflow-y-auto">
                                {processedFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-surface2 p-3 rounded-lg border">
                                        <span className="text-sm truncate max-w-[300px] text-text">{f.name}</span>
                                        <div className="flex gap-2 items-center">
                                            <audio controls src={f.url} className="h-8" />
                                            <a href={f.url} download={f.name}>
                                                <Button size="sm" variant="outline">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {t('download')}
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileAudio className="w-6 h-6" />
                        {t('title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!loaded && (
                        <div className="flex items-center gap-2 text-warning bg-surface2 border border-warning/20 p-4 rounded-md text-sm">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            <span>{isLoading ? t('loadingCore') : t('coreNotLoaded')}</span>
                        </div>
                    )}

                    {loaded && (
                        <>
                            <StepIndicator steps={steps} currentStep={currentStep} />

                            <div className="min-h-[300px]">
                                {renderStep()}
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t">
                                {currentStep > 1 && currentStep < 4 ? (
                                    <Button variant="outline" onClick={goPrev}>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        {t('prevButton')}
                                    </Button>
                                ) : currentStep === 5 ? (
                                    <Button variant="outline" onClick={startOver}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        {t('startOver')}
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 && (
                                    <Button onClick={goNext} disabled={!canProceed()}>
                                        {t('nextButton')}
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}

                                {currentStep === 3 && (
                                    <Button onClick={goNext} disabled={!canProceed() || isProcessing}>
                                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 w-4 h-4" />}
                                        {t('processButton')}
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
