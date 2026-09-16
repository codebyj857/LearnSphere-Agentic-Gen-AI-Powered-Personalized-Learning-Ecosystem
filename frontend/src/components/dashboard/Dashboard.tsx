import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlowingLineChart from './GlowingLineChart';
import CourseProgress from './CourseProgress';
import RoleSwitcher from './RoleSwitcher';
import { User, BookOpen, TrendingUp, Award } from 'lucide-react';

const SURVEY_ROLES = [
  'Data Scientist',
  'AI Researcher',
  'Web Developer',
  'Psychologist',
  'Botanist',
  'Zoologist',
  'Digital Marketer'
];

interface DashboardProps {
  userId: number;
}

const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [userData, setUserData] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [testScores, setTestScores] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId, currentRole]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load signed-in user from localStorage
      try {
        const savedUser = JSON.parse(localStorage.getItem('learnsphere_user') || 'null');
        setUserData(savedUser);
      } catch (e) {
        setUserData(null);
      }

      // Load test history from localStorage
      const testHistory = JSON.parse(localStorage.getItem('test_history') || '[]');
      setTestScores(testHistory);

      // Build the role dropdown: survey roles + any custom role the user picked
      const savedRole = localStorage.getItem('target_role');
      const roleList = [...SURVEY_ROLES];
      if (savedRole && !roleList.some(r => r.toLowerCase() === savedRole.toLowerCase())) {
        roleList.push(savedRole);
      }
      setUserRoles(roleList.map(role => ({ role })));

      if (savedRole) {
        setCurrentRole(savedRole);
      }
      
      // Load progress data from localStorage
      const progressData = JSON.parse(localStorage.getItem('progress_data') || '{}');
      const completedSteps = Object.values(progressData).filter(Boolean).length;
      const totalSteps = Object.keys(progressData).length;
      const completionRate = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      
      setLearningProgress([
        {
          date: new Date().toISOString().split('T')[0],
          completion_rate: completionRate,
          time_spent: Math.floor(Math.random() * 120) + 30 // Random time between 30-150 minutes
        }
      ]);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
  };

  // Only the test attempts recorded for the currently selected profession
  const getRoleTestScores = () => {
    if (!currentRole) return testScores;
    const role = currentRole.trim().toLowerCase();
    return testScores.filter((result: any) => {
      const entryRole = (result.topic || result.userRole || result.role || '').trim().toLowerCase();
      return entryRole === role;
    });
  };

  const calculateStats = () => {
    const roleTests = getRoleTestScores();
    const averageScore = roleTests.length > 0 
      ? Math.round(roleTests.reduce((sum: number, result: any) => sum + result.score, 0) / roleTests.length)
      : 0;

    // Completion rate scoped to the selected role (saved by Roadmap as progress_<role>)
    let completionRate = 0;
    if (currentRole) {
      try {
        const roleProgress = JSON.parse(localStorage.getItem(`progress_${currentRole}`) || '{}');
        const roleCompleted = Object.values(roleProgress).filter(Boolean).length;
        const roleTotal = Object.keys(roleProgress).length;
        completionRate = roleTotal > 0 ? Math.round((roleCompleted / roleTotal) * 100) : 0;
      } catch (e) {
        completionRate = 0;
      }
    } else {
      completionRate = parseInt(localStorage.getItem('course_progress') || '0');
    }
    
    return {
      averageScore,
      totalTests: roleTests.length,
      completionRate,
      totalTimeSpent: learningProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0)
    };
  };

  const stats = calculateStats();
  const roleTests = getRoleTestScores();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Welcome back, {userData?.username || 'Learner'}
          </h1>
          <p 
            className="text-white/80 text-lg"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your learning journey continues
          </p>
        </div>
        
        <RoleSwitcher
          roles={userRoles}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Average Score
              </p>
              <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.averageScore}
              </p>
            </div>
            <div className="p-3 rounded-full neon-cyan bg-opacity-20">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Tests Completed
              </p>
              <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.totalTests}
              </p>
            </div>
            <div className="p-3 rounded-full neon-purple bg-opacity-20">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Completion Rate
              </p>
              <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
                {stats.completionRate}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 bg-opacity-20">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1" style={{ fontFamily: 'Times New Roman, serif' }}>
                Study Time
              </p>
              <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
                {Math.round(stats.totalTimeSpent / 60)}h
              </p>
            </div>
            <div className="p-3 rounded-full neon-cyan bg-opacity-20">
              <User className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2 card"
        >
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            Test Scores Over Time
          </h3>
          {roleTests.length > 0 ? (
            <div className="h-64">
              <GlowingLineChart 
                data={roleTests.map((result: any, index: number) => ({
                  name: `Test ${index + 1}`,
                  date: result.date || result.created_at,
                  score: result.score
                }))}
                dataKey="score"
                strokeColor="#10b981"
                glowColor="#10b981"
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-white/60" style={{ fontFamily: 'Times New Roman, serif' }}>
                No test data for {currentRole || 'this role'} yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Course Progress */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card"
        >
          <CourseProgress completionRate={stats.completionRate} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="card"
      >
        <h2 
          className="text-2xl font-bold text-white mb-4"
          style={{ fontFamily: 'Times New Roman, serif' }}
        >
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          {roleTests.slice(0, 5).map((score, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <p className="text-white font-medium" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {score.topic}
                </p>
                <p className="text-white/60 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {score.date ? new Date(score.date).toLocaleDateString() : 'Recent'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gradient" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {(() => {
                    const maxScore = score.max_score || 10;
                    const pct = Math.round(((score.score || 0) / maxScore) * 100);
                    return `${Math.min(100, Math.max(0, pct))}%`;
                  })()}
                </p>
                <p className="text-white/60 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
                  {score.score || 0}/{score.max_score || 10}
                </p>
              </div>
            </div>
          ))}
          
          {roleTests.length === 0 && (
            <p className="text-white/60 text-center py-8" style={{ fontFamily: 'Times New Roman, serif' }}>
              No recent activity for {currentRole || 'this role'} yet. Start your learning journey!
            </p>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
