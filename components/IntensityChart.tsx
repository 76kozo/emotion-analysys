import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';
  import { emotions, emotionKeys } from '../lib/emotionData'; // 正しい設定ファイルからインポート
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  interface IntensityChartProps {
    data: ChartData<'bar'>;
  }
  
  export const IntensityChart = ({ data }: IntensityChartProps) => {
    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              const key = emotionKeys[index];
              const emotion = emotions[key as keyof typeof emotions];
              return `${emotion.japanese} ${emotion.emoji}`;
            },
            label: (context) => {
              let label = '強さ';
              if (context.parsed.y !== null) {
                label += `: ${context.parsed.y.toFixed(2)}`;
              }
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1.0,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ccc' },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#ccc', display: false }, // X軸のラベルは非表示
        },
      },
    };
  
    return <Bar options={options} data={data} />;
  } 