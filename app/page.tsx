"use client";

import { useState, useRef, useEffect } from 'react';
import { IntensityChart } from '../components/IntensityChart';
import { DistributionChart } from '../components/DistributionChart';
import { TimelineChart } from '../components/TimelineChart';
import CustomLegend from '../components/CustomLegend';
// 感情データを一元管理された設定ファイルからインポートします
import { emotions, emotionKeys } from '../lib/emotionData';
import type { ChartData } from 'chart.js';

// 感情の日本語ラベルと色を生成
const emotionJapaneseLabels = emotionKeys.map(key => emotions[key as keyof typeof emotions].japanese);
const emotionColors = Object.values(emotions).map(e => e.color);


// Google Vision APIの応答文字列と内部的な感情スコアをマッピングします
const LIKELIHOOD_MAPPING: { [key: string]: number } = {
    UNKNOWN: 0.1,
    VERY_UNLIKELY: 0.2,
    UNLIKELY: 0.4,
    POSSIBLE: 0.6,
    LIKELY: 0.8,
    VERY_LIKELY: 1.0,
};

export default function Home() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastApiCallTime, setLastApiCallTime] = useState(0);
    const [apiKey, setApiKey] = useState('');
    const [isCameraOn, setIsCameraOn] = useState(true);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const [intensityData, setIntensityData] = useState<ChartData<'bar'>>({
        labels: emotionJapaneseLabels,
        datasets: [{
            label: 'Intensity',
            data: emotionKeys.map(() => 0),
            backgroundColor: emotionColors,
            borderColor: emotionColors,
            borderWidth: 1
        }]
    });

    const [distributionData, setDistributionData] = useState<ChartData<'doughnut'>>({
        labels: emotionJapaneseLabels,
        datasets: [{
            label: 'Distribution',
            data: emotionKeys.map(() => 1), // Start with equal distribution
            backgroundColor: emotionColors,
            hoverOffset: 4
        }]
    });

    const [timelineData, setTimelineData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: emotionKeys.map(key => ({
            label: emotions[key as keyof typeof emotions].japanese,
            data: [],
            borderColor: emotions[key as keyof typeof emotions].color,
            backgroundColor: `${emotions[key as keyof typeof emotions].color}33`, // Add alpha for fill
            fill: true,
            tension: 0.4,
        }))
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const storedApiKey = localStorage.getItem('googleApiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    }, []);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('googleApiKey', apiKey);
        }
    }, [apiKey]);

    useEffect(() => {
        if (isAnalyzing) {
            intervalRef.current = setInterval(analyzeFrame, 1000); // 1秒ごとに実行
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAnalyzing]);
    
    useEffect(() => {
        const enableCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                mediaStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                alert("カメラへのアクセスに失敗しました。ブラウザの設定を確認してください。");
                setIsCameraOn(false);
            }
        };

        const disableCamera = () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        if (isCameraOn) {
            enableCamera();
        } else {
            disableCamera();
        }

        return () => {
            disableCamera();
        };
    }, [isCameraOn]);

    const handleStartCapture = async () => {
        if (!apiKey) {
            alert('Google Cloud Vision APIキーを入力してください。');
            return;
        }
        setIsAnalyzing(true);
    };

    const handleStopCapture = () => {
        setIsAnalyzing(false);
    };
    
    const analyzeFrame = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended || !apiKey) {
            return;
        }

        const now = Date.now();
        if (now - lastApiCallTime < 2000) { // 2秒間のクールダウン
            return;
        }
        setLastApiCallTime(now);

        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64_image = tempCanvas.toDataURL('image/jpeg').split(',')[1];

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64_image, apiKey: apiKey }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Google Vision API Error:", errorText);
                return;
            }

            const result = await response.json();
            const faceAnnotation = result.responses?.[0]?.faceAnnotations?.[0];
            
            // Canvas描画処理
            drawFaceOverlay(faceAnnotation);
            
            if (faceAnnotation) {
                const newScores: { [key: string]: number } = {};
                emotionKeys.forEach(key => { newScores[key] = 0; });
            
                Object.keys(emotions).forEach(key => {
                    const emotion = emotions[key as keyof typeof emotions];
                    const likelihood = faceAnnotation[emotion.apiLabel as keyof typeof faceAnnotation];
                    if (likelihood && LIKELIHOOD_MAPPING[likelihood]) {
                        newScores[key] = LIKELIHOOD_MAPPING[likelihood];
                    }
                });
            
                // neutralはAPIレスポンスに直接含まれないため、他の感情がない場合に設定
                const totalScore = Object.values(newScores).reduce((sum, score) => sum + score, 0);
                if (totalScore < 0.1) { 
                    newScores.neutral = 0.5;
                }
            
                updateCharts(newScores);
            } else {
                 // 顔が検出されなかったらCanvasをクリア
                 const overlayCtx = canvasRef.current?.getContext('2d');
                 if (overlayCtx && canvasRef.current) {
                    overlayCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                 }
                 updateCharts({ neutral: 0.5 });
            }
        } catch (error) {
            console.error('Error analyzing frame:', error);
            setIsAnalyzing(false); 
        }
    };
    
    // 顔のフレームを描画する新しい関数
    const drawFaceOverlay = (faceAnnotation: any) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Canvasのサイズをビデオの表示サイズに合わせる
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        // 毎フレーム描画をクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 顔が検出されなかった場合はここで処理を終了
        if (!faceAnnotation?.boundingPoly?.vertices) {
            return;
        }

        const videoDisplayWidth = video.clientWidth;
        const videoDisplayHeight = video.clientHeight;
        const videoActualWidth = video.videoWidth;
        const videoActualHeight = video.videoHeight;
        
        const scale = Math.min(videoDisplayWidth / videoActualWidth, videoDisplayHeight / videoActualHeight);
        const offsetX = (videoDisplayWidth - videoActualWidth * scale) / 2;
        const offsetY = (videoDisplayHeight - videoActualHeight * scale) / 2;
        
        const vertices = faceAnnotation.boundingPoly.vertices;
        const startPoint = vertices[0];
        const endPoint = vertices[2];

        const x = startPoint.x * scale + offsetX;
        const y = startPoint.y * scale + offsetY;
        const width = (endPoint.x - startPoint.x) * scale;
        const height = (endPoint.y - startPoint.y) * scale;

        // 1. フレームの描画
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);
        
        // 2. 最も強い感情を特定
        let dominantEmotion = 'neutral';
        let maxScore = 0;
        
        emotionKeys.forEach(key => {
            const score = LIKELIHOOD_MAPPING[faceAnnotation[emotions[key as keyof typeof emotions].apiLabel]] || 0;
            if (score > maxScore) {
                maxScore = score;
                dominantEmotion = key;
            }
        });
        
        // 3. アノテーションテキストの描画
        const emotionName = dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);
        const label = `${emotionName}: ${Math.round(maxScore * 100)}%`;
        
        ctx.font = '20px sans-serif';
        const textMetrics = ctx.measureText(label);
        const textX = x;
        const textY = y - 10;
        
        // テキスト背景の描画
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(textX - 5, textY - 22, textMetrics.width + 10, 30);
        
        // テキスト本体の描画
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, textX, textY);
    };

    const updateCharts = (analysis: { [key: string]: number }) => {
        if (!analysis) return;
    
        const scores = emotionKeys.map(key => analysis[key] || 0);
    
        // Intensity Chart Update
        setIntensityData(prevData => ({
            ...prevData,
            datasets: [{
                ...prevData.datasets[0],
                data: scores,
            }],
        }));
    
        // Distribution Chart Update
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const distribution = totalScore > 0 ? scores.map(s => s / totalScore * 100) : emotionKeys.map(() => 100 / emotionKeys.length);
        setDistributionData(prevData => ({
            ...prevData,
            datasets: [{
                ...prevData.datasets[0],
                data: distribution,
            }],
        }));
    
        // Timeline Chart Update
        setTimelineData(prevData => {
            const now = new Date();
            const newLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const newLabels = [...prevData.labels as string[], newLabel].slice(-30);
    
            const newDatasets = prevData.datasets.map((dataset, i) => {
                const key = emotionKeys[i];
                return {
                    ...dataset,
                    data: [...dataset.data as number[], analysis[key] || 0].slice(-30),
                };
            });
    
            return {
                labels: newLabels,
                datasets: newDatasets,
            };
        });
    };

    const handleToggleCamera = () => {
        setIsCameraOn(prev => !prev);
    };

    // CSVダウンロード処理の関数
    const handleDownloadCSV = () => {
        const { labels, datasets } = timelineData;
        if (!labels || labels.length === 0) {
            alert('ダウンロードするデータがありません。');
            return;
        }

        // ヘッダー行の作成 (Time, 喜び, 悲しみ, ...)
        const headers = ['Time', ...datasets.map(d => d.label!)];
        let csvContent = headers.join(',') + '\n';

        // データ行の作成
        labels.forEach((time, index) => {
            const row = [time, ...datasets.map(d => (d.data[index] as number).toFixed(4))];
            csvContent += row.join(',') + '\n';
        });

        // BOMを追加してExcelでの文字化けを防ぐ
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('download', `emotion_log_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="text-white min-h-screen flex flex-col p-4 font-sans">
            <header className="w-full mb-4 flex-shrink-0">
                <h1 className="text-3xl font-bold text-center text-gray-200">リアルタイム感情分析</h1>
            </header>
            
            {/* Main content area with two columns */}
            <main className="flex-grow flex flex-col lg:flex-row gap-4 min-h-0">
                
                {/* Left Column: Video and Controls */}
                <div className="w-full lg:w-1/2 flex flex-col bg-gray-800 p-4 rounded-lg shadow-lg">
                    {/* Video player takes up most of the space, now with a relative container */}
                    <div className="relative flex-grow w-full aspect-video bg-black rounded-md">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain rounded-md" muted></video>
                        {/* Canvas for overlay */}
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
                    </div>
                    {/* Controls at the bottom */}
                    <div className="flex-shrink-0 w-full max-w-md mx-auto mt-4">
                         <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Google Cloud Vision APIキーを入力"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                         <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={handleToggleCamera}
                                className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ${
                                    isCameraOn ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                            >
                                {isCameraOn ? 'カメラOFF' : 'カメラON'}
                            </button>
                            <button
                                onClick={handleStartCapture}
                                disabled={isAnalyzing || !apiKey}
                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                分析開始
                            </button>
                            <button
                                onClick={handleStopCapture}
                                disabled={!isAnalyzing}
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                分析停止
                            </button>
                            <button
                                onClick={handleDownloadCSV}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                CSVダウンロード
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Right Column: Charts Area */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    {/* Top Row: Intensity and Distribution side-by-side */}
                    <div className="h-1/2 flex flex-col md:flex-row gap-4">
                        <div className="md:w-1/2 h-full bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
                            <h2 className="text-xl font-semibold mb-2 text-center text-gray-300">Intensity</h2>
                            <div className="relative flex-grow">
                                <IntensityChart data={intensityData} />
                            </div>
                        </div>
                        <div className="md:w-1/2 h-full bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
                            <h2 className="text-xl font-semibold mb-2 text-center text-gray-300">Distribution</h2>
                            <div className="relative flex-grow">
                                <DistributionChart data={distributionData} />
                            </div>
                        </div>
                    </div>
                    {/* Bottom Row: Timeline */}
                    <div className="h-1/2 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
                         <h2 className="text-xl font-semibold mb-2 text-center text-gray-300">Timeline (時系列)</h2>
                        <div className="relative flex-grow">
                             <TimelineChart data={timelineData} />
                        </div>
                        <CustomLegend />
                    </div>
                </div>
            </main>
        </div>
    );
}

// NOTE: Button styles and full function implementations will be fleshed out in the next steps.
// This sets up the structure and state management. 