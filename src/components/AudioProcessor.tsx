'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Progress, StepIndicator, Step, Checkbox } from '@/components/ui/simple-ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Download, FileAudio, ChevronLeft, ChevronRight, RotateCcw, Upload, Scissors, Music } from 'lucide-react';

type Mode = 'concat' | 'trim';
type TrimMode = 'startDuration' | 'durationEnd';



interface ModeCardProps {
    modeType: Mode;
    icon: React.ElementType;
    title: string;
    description: string;
    currentMode: Mode | null;
    onSelect: (m: Mode) => void;
}

const ModeCard = React.memo(function ModeCard({
    modeType,
    icon: Icon,
    title,
    description,
    currentMode,
    onSelect
}: ModeCardProps) {
    return (
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
});

export default function AudioProcessor() {
    const t = useTranslations('AudioProcessor');

    // FFmpeg state
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);

    // Configuration state
    const [files, setFiles] = useState<File[]>([]);
    const [introFile, setIntroFile] = useState<File | null>(null);
    const [outroFile, setOutroFile] = useState<File | null>(null);
    const [trimStart, setTrimStart] = useState<string>('0');
    const [trimDuration, setTrimDuration] = useState<string>('');
    const [trimEnd, setTrimEnd] = useState<string>('');
    const [trimMode, setTrimMode] = useState<TrimMode>('startDuration');
    const [mode, setMode] = useState<Mode | null>(null);

    // Processing state
    const [progress, setProgress] = useState<number>(0);
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [processedFiles, setProcessedFiles] = useState<{ name: string, url: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

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

            ffmpeg.on('log', () => {
                // FFmpeg logs are silenced in production
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

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    }, []);

    // Handle paste from clipboard
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const audioFiles: File[] = [];
        for (const item of items) {
            if (item.type.startsWith('audio/')) {
                const file = item.getAsFile();
                if (file) audioFiles.push(file);
            }
        }

        if (audioFiles.length > 0) {
            e.preventDefault();
            setFiles(prev => [...prev, ...audioFiles]);
            toast.success(`Added ${audioFiles.length} file(s) from clipboard`);
        }
    }, []);

    // Handle drag and drop
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer?.files;
        if (!droppedFiles) return;

        const audioFiles = Array.from(droppedFiles).filter(f => f.type.startsWith('audio/'));
        if (audioFiles.length > 0) {
            setFiles(prev => [...prev, ...audioFiles]);
        }
    }, []);

    const canProceed = useCallback((): boolean => {
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
    }, [currentStep, mode, files.length]);

    const goNext = useCallback(() => {
        if (currentStep === 3) {
            // Start processing
            processFiles();
        } else if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    const goPrev = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const startOver = useCallback(() => {
        setCurrentStep(1);
        setMode(null);
        setFiles([]);
        setIntroFile(null);
        setOutroFile(null);
        setTrimStart('0');
        setTrimDuration('');
        setTrimEnd('');
        setTrimMode('startDuration');
        setProgress(0);
        setProcessedFiles([]);
        setCurrentFileIndex(0);
        setSelectedFiles(new Set());
    }, []);

    const toggleFileSelection = useCallback((index: number) => {
        setSelectedFiles(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedFiles(prev => {
            if (prev.size === processedFiles.length) {
                return new Set();
            } else {
                return new Set(processedFiles.map((_, i) => i));
            }
        });
    }, [processedFiles]);

    const downloadSelected = useCallback(() => {
        selectedFiles.forEach(index => {
            const file = processedFiles[index];
            if (file) {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }, [selectedFiles, processedFiles]);

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

                // Build FFmpeg args based on trim mode
                const args = ['-i', currentInput];

                if (trimMode === 'startDuration') {
                    // Mode 1: Start time + Duration
                    // No duration → trim from start to end of file
                    const ss = trimStart || '0';
                    args.push('-ss', ss);
                    if (trimDuration) {
                        args.push('-t', trimDuration);
                    }
                } else {
                    // Mode 2: Duration + End time (durationEnd)
                    // No duration → trim from beginning to end time
                    if (trimDuration) {
                        // Calculate start time: end - duration
                        const endSec = parseFloat(trimEnd) || 0;
                        const durSec = parseFloat(trimDuration) || 0;
                        const startSec = Math.max(0, endSec - durSec);
                        args.push('-ss', startSec.toString());
                    }
                    if (trimEnd) {
                        args.push('-to', trimEnd);
                    }
                }

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
            results.push({ name: file.name, url });

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
                        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
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
                                        <label
                                            className={cn(
                                                "flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                                introFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-surface"
                                            )}
                                        >
                                            <Upload className={cn("w-5 h-5", introFile ? "text-primary" : "text-muted")} />
                                            <span className={cn("text-sm truncate flex-1", introFile ? "text-primary" : "text-muted")}>
                                                {introFile ? introFile.name : t('singleFileDropzone')}
                                            </span>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => setIntroFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-muted">{t('introFileHint')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t('outroFileLabel')}</label>
                                        <label
                                            className={cn(
                                                "flex items-center gap-3 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                                outroFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-surface"
                                            )}
                                        >
                                            <Upload className={cn("w-5 h-5", outroFile ? "text-primary" : "text-muted")} />
                                            <span className={cn("text-sm truncate flex-1", outroFile ? "text-primary" : "text-muted")}>
                                                {outroFile ? outroFile.name : t('singleFileDropzone')}
                                            </span>
                                            <input
                                                type="file"
                                                accept="audio/*"
                                                onChange={(e) => setOutroFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-muted">{t('outroFileHint')}</p>
                                    </div>
                                </div>
                            )}

                            {(mode === 'trim') && (
                                <div className="space-y-5 p-5 rounded-xl border bg-surface">
                                    {/* Trim Mode Selection - Segment Control */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-muted">{t('trimModeLabel')}</label>
                                        <div className="flex p-1 bg-surface2 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setTrimMode('startDuration')}
                                                className={cn(
                                                    "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200",
                                                    trimMode === 'startDuration'
                                                        ? "bg-surface text-primary shadow-sm border border-border"
                                                        : "text-muted hover:text-text"
                                                )}
                                            >
                                                {t('trimModeStartDuration')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTrimMode('durationEnd')}
                                                className={cn(
                                                    "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200",
                                                    trimMode === 'durationEnd'
                                                        ? "bg-surface text-primary shadow-sm border border-border"
                                                        : "text-muted hover:text-text"
                                                )}
                                            >
                                                {t('trimModeDurationEnd')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Fields for Start + Duration mode */}
                                    {trimMode === 'startDuration' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{t('startTimeLabel')}</label>
                                                <Input type="text" placeholder={t('startTimeHint')} value={trimStart} onChange={(e) => setTrimStart(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{t('durationLabel')}</label>
                                                <Input type="text" placeholder={t('durationPlaceholder')} value={trimDuration} onChange={(e) => setTrimDuration(e.target.value)} />
                                            </div>
                                        </>
                                    )}

                                    {/* Fields for Duration + End mode */}
                                    {trimMode === 'durationEnd' && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{t('durationFromEndLabel')}</label>
                                                <Input type="text" placeholder={t('durationFromEndHint')} value={trimDuration} onChange={(e) => setTrimDuration(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">{t('endTimeLabel')}</label>
                                                <Input type="text" placeholder={t('endTimeHint')} value={trimEnd} onChange={(e) => setTrimEnd(e.target.value)} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div
                        className="space-y-6"
                        onPaste={handlePaste}
                        tabIndex={0}
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-semibold mb-2">{t('step3Heading')}</h2>
                            <p className="text-muted text-sm">{t('step3Description')}</p>
                        </div>
                        <div className="max-w-lg mx-auto">
                            <label
                                htmlFor="file-upload"
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                                    isDragging ? "border-primary bg-primary/10 scale-[1.02]" :
                                        files.length > 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-surface"
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <Upload className={cn("w-10 h-10 mb-4 transition-transform",
                                    isDragging ? "text-primary scale-110" :
                                        files.length > 0 ? "text-primary" : "text-muted"
                                )} />
                                {files.length > 0 ? (
                                    <span className="text-primary font-medium">{t('filesSelected', { count: files.length })}</span>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-center px-4">
                                        <span className="text-muted">{t('dropzoneText')}</span>
                                        <Button type="button" variant="secondary" size="sm">{t('selectFileButton')}</Button>
                                        <span className="text-xs text-muted/70 mt-2">{t('dropzoneMultiHint')}</span>
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
                            {/* Header with select all and download selected */}
                            <div className="flex items-center justify-between p-3 bg-surface2 rounded-t-lg border border-b-0">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        checked={selectedFiles.size === processedFiles.length && processedFiles.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-sm font-medium">{t('selectAll')}</span>
                                </label>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={downloadSelected}
                                    disabled={selectedFiles.size === 0}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t('downloadSelected')} ({selectedFiles.size})
                                </Button>
                            </div>
                            {/* File list */}
                            <div className="border rounded-b-lg max-h-60 overflow-y-auto">
                                {processedFiles.map((f, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer transition-colors",
                                            selectedFiles.has(i) ? "bg-primary/5" : "hover:bg-surface2"
                                        )}
                                        onClick={() => toggleFileSelection(i)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={selectedFiles.has(i)}
                                                onCheckedChange={() => toggleFileSelection(i)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <FileAudio className="w-4 h-4 text-muted" />
                                            <span className="text-sm truncate max-w-[300px]">{f.name}</span>
                                        </div>
                                        <a href={f.url} download={f.name} onClick={(e) => e.stopPropagation()}>
                                            <Button size="sm" variant="ghost">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
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
                                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <ChevronRight className="mr-2 w-4 h-4" />}
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
