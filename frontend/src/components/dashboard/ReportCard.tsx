import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Clock, Target } from 'lucide-react';

interface ReportCardProps {
  userId: number;
  currentRole: string;
  stats: {
    averageScore: number;
    totalTests: number;
    completionRate: number;
    totalTimeSpent: number;
  };
}

const ReportCard: React.FC<ReportCardProps> = ({ userId, currentRole, stats }) => {
  const [userLevel, setUserLevel] = useState<string>('Beginner');
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    loadSurveyData();
  }, [userId]);

  const loadSurveyData = async () => {
    try {
      const response = await fetch(`/api/survey/results/${userId}`);
      const data = await response.json();
      
      if (data.success && data.survey) {
        setSurveyData(data.survey);
        setUserLevel(data.survey.user_level || 'Beginner');
      }
    } catch (error) {
      console.error('Error loading survey data:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'expert':
        return 'text-purple-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getPerformanceGrade = () => {
    if (stats.averageScore >= 90) return { grade: 'A+', color: 'text-green-400' };
    if (stats.averageScore >= 80) return { grade: 'A', color: 'text-cyan-400' };
    if (stats.averageScore >= 70) return { grade: 'B', color: 'text-blue-400' };
    if (stats.averageScore >= 60) return { grade: 'C', color: 'text-yellow-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const performance = getPerformanceGrade();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="card h-full"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Report Card
          </h3>
          <div className="inline-flex items-center px-3 py-1 rounded-full glass">
            <span className={`text-sm font-medium ${getLevelColor(userLevel)}`} style={{ fontFamily: 'Times New Roman, serif' }}>
              {userLevel}
            </span>
          </div>
        </div>

        {/* Performance Grade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="relative inline-block">
            <div className={`text-6xl font-bold ${performance.color} neon-text`} style={{ fontFamily: 'Times New Roman, serif' }}>
              {performance.grade}
            </div>
            <div className="absolute -top-2 -right-2">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-white/80 mt-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            Overall Performance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-cyan-400" />
              <span className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                Average Score
              </span>
            </div>
            <span className="text-xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
              {stats.averageScore}%
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                Completion Rate
              </span>
            </div>
            <span className="text-xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
              {stats.completionRate}%
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-400" />
              <span className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                Study Time
              </span>
            </div>
            <span className="text-xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
              {stats.totalTimeSpent}h
            </span>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                Course Progress
              </span>
              <span className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full neon-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h4 
            className="text-lg font-semibold text-white mb-3"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Recent Achievements
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {stats.averageScore >= 80 && (
              <div className="text-center p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <Award className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-xs text-yellow-400" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Top Performer
                </p>
              </div>
            )}
            
            {stats.totalTests >= 5 && (
              <div className="text-center p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <Target className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-cyan-400" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Test Taker
                </p>
              </div>
            )}
            
            {stats.completionRate >= 50 && (
              <div className="text-center p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-purple-400" style={{ fontFamily: 'Times New Roman, serif' }}>
                  Dedicated
                </p>
              </div>
            )}
          </div>
          
          {stats.averageScore < 80 && stats.totalTests < 5 && stats.completionRate < 50 && (
            <p className="text-white/60 text-center text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
              Complete more activities to unlock achievements!
            </p>
          )}
        </motion.div>

        {/* Current Role */}
        {currentRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center p-3 rounded-lg border-gradient"
          >
            <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
              Current Focus
            </p>
            <p className="text-lg font-semibold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
              {currentRole}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ReportCard;
