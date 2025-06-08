/**
 * アプリケーション全体で共有される感情データの定義と、
 * それに関連する定数を一元管理します。
 */
export const emotions = {
    neutral:   { japanese: '平常',   color: '#A9A9A9', apiLabel: 'neutralLikelihood', emoji: '😐' },
    happy:     { japanese: '喜び',   color: '#4CAF50', apiLabel: 'joyLikelihood',    emoji: '😊' },
    sorrow:    { japanese: '悲しみ', color: '#2196F3', apiLabel: 'sorrowLikelihood',   emoji: '😢' },
    angry:     { japanese: '怒り',   color: '#F44336', apiLabel: 'angerLikelihood',    emoji: '😠' },
    fearful:   { japanese: '恐れ',   color: '#9C27B0', apiLabel: 'fearLikelihood',   emoji: '😨' },
    disgusted: { japanese: '嫌悪',   color: '#FF9800', apiLabel: 'disgustLikelihood',  emoji: '🤢' },
    surprised: { japanese: '驚き',   color: '#FFEB3B', apiLabel: 'surpriseLikelihood', emoji: '😮' },
};

export const emotionKeys = Object.keys(emotions); 