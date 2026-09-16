import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface ProgressChartProps {
  testScores: any[];
  learningProgress: any[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ testScores, learningProgress }) => {
  // Safely format the test attempt's completion date for the tooltip
  const formatDate = (value: any) => {
    if (!value) return 'No date';
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
  };

  // Prepare data for line chart (test scores over time)
  const prepareScoreData = () => {
    return testScores.slice(0, 10).reverse().map((score, index) => {
      const maxScore = score.max_score || 10;
      const pct = Math.round((score.score || 0) / maxScore * 100);
      return {
        name: `Test ${index + 1}`,
        date: formatDate(score.date || score.created_at),
        score: Math.min(100, Math.max(0, pct)),
        topic: score.topic
      };
    });
  };

  // Prepare data for bar chart (topic mastery)
  const prepareProgressData = () => {
    return learningProgress.slice(0, 8).map(progress => ({
      topic: (progress.topic || 'Topic').length > 15 ? (progress.topic || 'Topic').substring(0, 15) + '...' : (progress.topic || 'Topic'),
      completion: Math.round(progress.completion || 0),
      timeSpent: Math.round((progress.time_spent || 0) / 60 * 10) / 10 // Convert to hours with 1 decimal
    }));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="glass-dark p-3 rounded-lg border border-white/20">
          <p className="text-white font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
            {label}
          </p>
          {point && point.date && (
            <p className="text-white/70 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
              {point.date}
            </p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white/80 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const scoreData = prepareScoreData();
  const progressData = prepareProgressData();

  return (
    <div className="space-y-6">
      {/* Test Scores Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="chart-container"
      >
        <h3 
          className="text-xl font-bold text-white mb-4"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Test Performance Trend
        </h3>
        
        {scoreData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={scoreData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#scoreGradient)"
                dot={{ fill: '#06b6d4', r: 6 }}
                activeDot={{ r: 8, fill: '#0891b2' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/60" style={{ fontFamily: 'Times New Roman, serif' }}>
              No test data available yet
            </p>
          </div>
        )}
      </motion.div>

      {/* Topic Mastery Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="chart-container"
      >
        <h3 
          className="text-xl font-bold text-white mb-4"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Topic Mastery Progress
        </h3>
        
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={progressData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                type="number"
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}
                domain={[0, 100]}
              />
              <YAxis 
                type="category"
                dataKey="topic"
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="completion" 
                fill="url(#barGradient)"
                radius={[0, 8, 8, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/60" style={{ fontFamily: 'Times New Roman, serif' }}>
              No progress data available yet
            </p>
          </div>
        )}
      </motion.div>

      {/* Study Time Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="chart-container"
      >
        <h3 
          className="text-xl font-bold text-white mb-4"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Study Time Distribution
        </h3>
        
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="topic"
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '10px' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12px' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman, serif' } }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-dark p-3 rounded-lg border border-white/20">
                        <p className="text-white font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
                          {payload[0].payload.topic}
                        </p>
                        <p className="text-white/80 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                          Study Time: {payload[0].value} hours
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="timeSpent"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{ fill: '#fbbf24', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-white/60" style={{ fontFamily: 'Times New Roman, serif' }}>
              No study time data available yet
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProgressChart;
