"use client";

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { emotions, emotionKeys } from '../lib/emotionData';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartColors = [
    'rgba(156, 163, 175, 0.7)', // Neutral
    'rgba(22, 163, 74, 0.8)',   // Happy
    'rgba(59, 130, 246, 0.8)',  // Sad
    'rgba(239, 68, 68, 0.8)',   // Angry
    'rgba(168, 85, 247, 0.8)',  // Fearful
    'rgba(132, 204, 22, 0.8)',  // Disgusted
    'rgba(245, 158, 11, 0.8)',  // Surprised
];


export const data = {
  labels: ['Neutral', 'Happy', 'Sad', 'Angry', 'Fearful', 'Disgusted', 'Surprised'],
  datasets: [
    {
      label: '# of Votes',
      data: [1, 0, 0, 0, 0, 0, 0], // Initial data
      backgroundColor: chartColors,
      borderColor: chartColors.map(color => color.replace('0.8', '1').replace('0.7', '1')),
      borderWidth: 1,
    },
  ],
};

interface DistributionChartProps {
    data: ChartData<'doughnut'>;
}

export const DistributionChart = ({ data }: DistributionChartProps) => {
    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        // ドーナツチャートでは通常タイトルは不要なため空文字を返す
                        return '';
                    },
                    label: (context) => {
                        const index = context.dataIndex;
                        const key = emotionKeys[index];
                        const emotion = emotions[key as keyof typeof emotions];
                        let value = context.parsed;
                        if (value !== null) {
                            return `${emotion.japanese} ${emotion.emoji}: ${value.toFixed(1)}%`;
                        }
                        return `${emotion.japanese} ${emotion.emoji}`;
                    },
                },
            },
        },
    };
    return <Doughnut data={data} options={options} />;
}; 