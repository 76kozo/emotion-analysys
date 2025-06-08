"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { emotions } from '../lib/emotionData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartColors = {
    neutral: 'rgba(156, 163, 175, 0.7)',
    joy: 'rgba(22, 163, 74, 0.8)',
    sorrow: 'rgba(59, 130, 246, 0.8)',
    anger: 'rgba(239, 68, 68, 0.8)',
    surprise: 'rgba(245, 158, 11, 0.8)',
    fearful: 'rgba(168, 85, 247, 0.8)',
    disgusted: 'rgba(132, 204, 22, 0.8)',
};

interface TimelineChartProps {
    data: ChartData<'line'>;
}

export const TimelineChart = ({ data }: TimelineChartProps) => {
    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const key = Object.keys(emotions).find(k => emotions[k as keyof typeof emotions].japanese === label);
                        const emoji = key ? emotions[key as keyof typeof emotions].emoji : '';
                        const value = context.parsed.y;
                        if (value !== null) {
                            return `${label} ${emoji}: ${value.toFixed(2)}`;
                        }
                        return `${label} ${emoji}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'var(--text-secondary-color)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                beginAtZero: true,
                max: 1.0,
                ticks: {
                    color: 'var(--text-secondary-color)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    return <Line options={options} data={data} />;
}; 