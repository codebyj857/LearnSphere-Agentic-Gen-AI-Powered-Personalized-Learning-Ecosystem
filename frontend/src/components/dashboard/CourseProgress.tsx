import React from 'react';

interface CourseProgressProps {
  completionRate: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ completionRate }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
          Course Progress
        </h3>
        <span className="text-2xl font-bold text-cyan-400">{completionRate}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${completionRate}%` }}
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              style={{
                animation: 'shimmer 2s infinite',
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className={`text-xs ${
                completionRate >= marker ? 'text-cyan-400' : 'text-gray-500'
              }`}
            >
              {marker}%
            </div>
          ))}
        </div>
      </div>
      
      {/* Status message */}
      <div className="text-center">
        <p className="text-gray-300 text-sm">
          {completionRate === 0 && "Start your learning journey!"}
          {completionRate > 0 && completionRate < 25 && "Great start! Keep going!"}
          {completionRate >= 25 && completionRate < 50 && "Making good progress!"}
          {completionRate >= 50 && completionRate < 75 && "Halfway there! You're doing amazing!"}
          {completionRate >= 75 && completionRate < 100 && "Almost done! Final stretch!"}
          {completionRate === 100 && "🎉 Congratulations! Course completed!"}
        </p>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseProgress;
