import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, Clock, BookOpen, Target, Zap } from 'lucide-react';

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'current' | 'completed';
  resources: Array<{
    type: string;
    title: string;
    url: string;
  }>;
}

interface RoadmapDisplayProps {
  role: string;
  roadmapData: RoadmapStep[];
  onGenerateRoadmap: (role: string) => void;
  isGenerating: boolean;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ 
  role, 
  roadmapData, 
  onGenerateRoadmap, 
  isGenerating 
}) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-400 text-green-400';
      case 'current':
        return 'bg-yellow-500/20 border-yellow-400 text-yellow-400';
      case 'locked':
        return 'bg-gray-500/20 border-gray-400 text-gray-400';
      default:
        return 'bg-white/10 border-white/20 text-white/70';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'current':
        return <Play className="h-5 w-5" />;
      case 'locked':
        return <Clock className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {role}
            </span>
            <br />
            <span className="text-3xl md:text-4xl">Learning Path</span>
          </h1>
          
          <p 
            className="text-white/80 text-lg mb-6"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            Your personalized journey to mastering {role}
          </p>

          {/* Generate Roadmap Button */}
          <motion.button
            onClick={() => onGenerateRoadmap(role)}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl font-semibold text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <span>Generate Roadmap</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Roadmap Flowchart */}
        <AnimatePresence>
          {roadmapData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Connection Lines */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 opacity-30"></div>
              
              {/* Roadmap Steps */}
              <div className="space-y-8">
                {roadmapData.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      {/* Step Card */}
                      <motion.div
                        onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                        className={`glass p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                          getStatusColor(step.status)
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Step Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                              {getStatusIcon(step.status)}
                            </div>
                            <div>
                              <h3 
                                className="text-xl font-bold"
                                style={{ fontFamily: 'Times New Roman, serif' }}
                              >
                                Step {step.id}
                              </h3>
                              <p className="text-sm opacity-80">{step.duration}</p>
                            </div>
                          </div>
                          
                          <ArrowRight 
                            className={`h-5 w-5 transition-transform duration-300 ${
                              selectedStep === step.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>

                        {/* Step Content */}
                        <h4 
                          className="text-lg font-semibold mb-2"
                          style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                          {step.title}
                        </h4>
                        <p className="text-sm opacity-80 mb-4">
                          {step.description}
                        </p>

                        {/* Progress Indicator */}
                        <div className="flex items-center space-x-2 text-sm">
                          <BookOpen className="h-4 w-4" />
                          <span>{step.resources.length} Resources</span>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {selectedStep === step.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-white/20"
                            >
                              <h5 
                                className="font-semibold mb-3"
                                style={{ fontFamily: 'Times New Roman, serif' }}
                              >
                                Learning Resources:
                              </h5>
                              <div className="space-y-2">
                                {step.resources.map((resource, idx) => (
                                  <motion.a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    whileHover={{ x: 5 }}
                                  >
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                    <span className="text-sm">{resource.title}</span>
                                    <span className="text-xs opacity-60">({resource.type})</span>
                                  </motion.a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>

                    {/* Center Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-white font-bold text-sm">{step.id}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Completion Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: roadmapData.length * 0.1 }}
                className="text-center mt-12"
              >
                <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 rounded-2xl">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span 
                    className="text-green-400 font-semibold"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    Journey Complete! You're now a {role}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {roadmapData.length === 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <Target className="h-16 w-16 text-purple-400" />
            </div>
            <h2 
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Times New Roman, serif' }}
            >
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/60 mb-8">
              Click the "Generate Roadmap" button to create your personalized learning path for {role}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDisplay;
