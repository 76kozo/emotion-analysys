import React from 'react';

// 感情の定義をこのコンポーネント内に再定義します。
// これにより、外部ファイルへの依存がなくなり、安定動作します。
const emotions = {
    neutral:   { japanese: '平常',   color: '#A9A9A9', emoji: '😐' },
    happy:     { japanese: '喜び',   color: '#4CAF50', emoji: '😊' },
    sorrow:    { japanese: '悲しみ', color: '#2196F3', emoji: '😢' },
    angry:     { japanese: '怒り',   color: '#F44336', emoji: '😠' },
    fearful:   { japanese: '恐れ',   color: '#9C27B0', emoji: '😨' },
    disgusted: { japanese: '嫌悪',   color: '#FF9800', emoji: '🤢' },
    surprised: { japanese: '驚き',   color: '#FFEB3B', emoji: '😮' },
};

const emotionKeys = Object.keys(emotions);

/**
 * HTMLとCSSで完全にカスタマイズされた凡例コンポーネント。
 */
const CustomLegend = () => {
    return (
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 pt-3">
            {emotionKeys.map((key: string) => {
                const emotion = emotions[key as keyof typeof emotions];
                return (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-gray-400 font-light">
                        <span
                            className="w-4 h-2.5 inline-block rounded-sm"
                            style={{ backgroundColor: emotion.color, border: `1px solid ${emotion.color}` }}
                        ></span>
                        <span>{emotion.japanese}</span>
                        {/* 絵文字だけを選択的に大きく表示します */}
                        <span className="text-xl leading-none" style={{fontFamily: "Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol"}}>
                            {emotion.emoji}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default CustomLegend; 