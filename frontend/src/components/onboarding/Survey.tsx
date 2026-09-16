import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, GraduationCap } from 'lucide-react';

const Survey = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field: '',
    role: '',
    experience: 5
  });

  const commonRoles = [
    "Data Scientist", "AI Researcher", "Web Developer", 
    "Psychologist", "Botanist", "Zoologist", "Digital Marketer"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save to LocalStorage
    localStorage.setItem('target_role', formData.role || "General Learner");
    localStorage.setItem('user_experience', formData.experience.toString());
    
    // Simulate AI generation delay
    setTimeout(() => {
      setLoading(false);
      navigate('/roadmap');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Chart Your Course</h1>
          <p className="text-gray-400">Tell us what you want to become, and we'll build the path.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Field of Interest */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Field of Study</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-3 text-gray-500" size={18} />
              <select 
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                onChange={(e) => setFormData({...formData, field: e.target.value})}
              >
                <option value="">Select a Field...</option>
                <option value="cs">Computer Science & Tech</option>
                <option value="science">Biological Sciences (Botany/Zoology)</option>
                <option value="humanities">Psychology & Social Sciences</option>
                <option value="business">Business & Marketing</option>
                <option value="other">Other / General Interest</option>
              </select>
            </div>
          </div>

          {/* Question 2: Specific Role (With Manual Entry) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dream Career Role</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 text-gray-500" size={18} />
              <input 
                type="text" 
                required
                list="roles-list"
                placeholder="Type ANY career (e.g. Astronaut, Chef, Zoologist)..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
              <datalist id="roles-list">
                {commonRoles.map(role => <option key={role} value={role} />)}
              </datalist>
            </div>
          </div>

          {/* Question 3: Experience Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Current Knowledge Level</label>
              <span className="text-purple-400 font-bold">{formData.experience}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Novice</span>
              <span>Expert</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Generating Roadmap...</span>
            ) : (
              <>Generate My Roadmap <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Survey;
