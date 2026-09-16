import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Settings } from 'lucide-react';

interface RoleSwitcherProps {
  roles: any[];
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ roles, currentRole, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);

  const availableRoles = [
    'Data Science',
    'Web Development',
    'Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Mobile Development'
  ];

  const userRoles = roles.map(r => r.role);
  const unassignedRoles = availableRoles.filter(role => !userRoles.includes(role));

  const handleRoleSelect = (role: string) => {
    localStorage.setItem('target_role', role);
    window.dispatchEvent(new Event('storage'));
    onRoleChange(role);
    setIsOpen(false);
  };

  const handleAddRole = async (role: string) => {
    try {
      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await fetch(`/api/user/${userData.user_id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_name: role })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the page or update roles list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
    
    setShowAddRole(false);
  };

  return (
    <div className="relative">
      {/* Main Role Selector */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-xl glass hover:bg-white/20 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"></div>
          <span 
            className="text-white font-medium"
            style={{ fontFamily: 'Times New Roman, serif' }}
          >
            {currentRole || 'Select Role'}
          </span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 glass-dark rounded-xl border border-white/20 shadow-2xl z-50"
          >
            <div className="p-2">
              {/* Current Roles */}
              <div className="mb-3">
                <p 
                  className="text-white/60 text-xs uppercase tracking-wider mb-2 px-2"
                  style={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Your Roles
                </p>
                {roles.map((role, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleRoleSelect(role.role)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      role.role === currentRole 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30' 
                        : 'hover:bg-white/10'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <span 
                      className={`${
                        role.role === currentRole ? 'text-white font-medium' : 'text-white/80'
                      }`}
                      style={{ fontFamily: 'Times New Roman, serif' }}
                    >
                      {role.role}
                    </span>
                    {role.role === currentRole && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Add New Role */}
              <div className="border-t border-white/10 pt-2">
                <motion.button
                  onClick={() => setShowAddRole(!showAddRole)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-between group"
                  whileHover={{ x: 4 }}
                >
                  <span className="text-cyan-400 font-medium flex items-center space-x-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                    <Plus className="h-4 w-4" />
                    <span>Add New Role</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${showAddRole ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Available Roles */}
                <AnimatePresence>
                  {showAddRole && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 space-y-1"
                    >
                      {unassignedRoles.length > 0 ? (
                        unassignedRoles.map((role, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleAddRole(role)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-cyan-500/10 transition-all duration-200 flex items-center space-x-2 group"
                            whileHover={{ x: 4 }}
                          >
                            <Plus className="h-3 w-3 text-cyan-400" />
                            <span className="text-white/70 group-hover:text-cyan-300" style={{ fontFamily: 'Times New Roman, serif' }}>
                              {role}
                            </span>
                          </motion.button>
                        ))
                      ) : (
                        <p className="text-white/50 text-sm px-3 py-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                          All roles assigned
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings Link */}
              <div className="border-t border-white/10 pt-2 mt-2">
                <motion.button
                  className="w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2 group"
                  whileHover={{ x: 4 }}
                >
                  <Settings className="h-4 w-4 text-white/60 group-hover:text-white/80" />
                  <span className="text-white/60 group-hover:text-white/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                    Role Settings
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleSwitcher;
