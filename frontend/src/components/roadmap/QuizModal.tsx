import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, CheckCircle, AlertCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  score: number;
  max_score: number;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  date: string;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Question banks for different roles
  const questionBanks: { [key: string]: Omit<Question, 'id'>[] } = {
    'Data Scientist': [
      {
        question: "What is the purpose of the train-test split in machine learning?",
        options: [
          "To increase dataset size",
          "To evaluate model performance on unseen data",
          "To reduce training time",
          "To improve model accuracy"
        ],
        correctAnswer: 1,
        explanation: "Train-test split helps evaluate how well your model generalizes to new, unseen data."
      },
      {
        question: "Which Python library is primarily used for data manipulation and analysis?",
        options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"],
        correctAnswer: 1,
        explanation: "Pandas is the go-to library for data manipulation and analysis in Python."
      },
      {
        question: "What does the term 'overfitting' mean in machine learning?",
        options: [
          "Model is too simple",
          "Model performs well on training data but poorly on test data",
          "Model has too many features",
          "Model is undertrained"
        ],
        correctAnswer: 1,
        explanation: "Overfitting occurs when a model learns the training data too well and fails to generalize."
      },
      {
        question: "Which statistical measure describes the spread of data?",
        options: ["Mean", "Median", "Standard Deviation", "Mode"],
        correctAnswer: 2,
        explanation: "Standard deviation measures how spread out the data points are from the mean."
      },
      {
        question: "What is the purpose of cross-validation?",
        options: [
          "To validate user input",
          "To get a more reliable estimate of model performance",
          "To clean the data",
          "To reduce features"
        ],
        correctAnswer: 1,
        explanation: "Cross-validation provides a more robust estimate of model performance by using multiple train-test splits."
      },
      {
        question: "Which algorithm is best suited for classification tasks?",
        options: ["Linear Regression", "Logistic Regression", "K-Means", "PCA"],
        correctAnswer: 1,
        explanation: "Logistic Regression is specifically designed for binary classification tasks."
      },
      {
        question: "What is a confusion matrix used for?",
        options: [
          "To confuse the model",
          "To evaluate classification performance",
          "To store model parameters",
          "To normalize data"
        ],
        correctAnswer: 1,
        explanation: "A confusion matrix helps evaluate the performance of a classification algorithm."
      },
      {
        question: "Which technique is used for feature selection?",
        options: ["One-hot encoding", "Normalization", "Recursive Feature Elimination", "Imputation"],
        correctAnswer: 2,
        explanation: "Recursive Feature Elimination is a technique for selecting the most important features."
      },
      {
        question: "What is the purpose of regularization in machine learning?",
        options: [
          "To make the model faster",
          "To prevent overfitting by adding a penalty term",
          "To increase model complexity",
          "To normalize the data"
        ],
        correctAnswer: 1,
        explanation: "Regularization adds a penalty term to prevent the model from becoming too complex and overfitting."
      },
      {
        question: "Which metric is used to evaluate regression models?",
        options: ["Accuracy", "Precision", "R-squared", "F1 Score"],
        correctAnswer: 2,
        explanation: "R-squared is commonly used to evaluate the performance of regression models."
      }
    ],
    'Web Developer': [
      {
        question: "What does CSS stand for?",
        options: [
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Cascading Style Sheets",
          "Colorful Style Sheets"
        ],
        correctAnswer: 2,
        explanation: "CSS stands for Cascading Style Sheets and is used to style web pages."
      },
      {
        question: "Which HTML5 element is used for navigation links?",
        options: ["<navigation>", "<nav>", "<navbar>", "<menu>"],
        correctAnswer: 1,
        explanation: "The <nav> element is specifically designed for navigation links in HTML5."
      },
      {
        question: "What is the purpose of React hooks?",
        options: [
          "To catch fish",
          "To add state and lifecycle features to functional components",
          "To style components",
          "To connect to databases"
        ],
        correctAnswer: 1,
        explanation: "React hooks allow functional components to use state and other React features."
      },
      {
        question: "Which method is used to make asynchronous requests in JavaScript?",
        options: ["setTimeout", "fetch()", "alert()", "console.log()"],
        correctAnswer: 1,
        explanation: "The fetch() API is used to make asynchronous network requests in JavaScript."
      },
      {
        question: "What is the box model in CSS?",
        options: [
          "A 3D modeling technique",
          "The layout of HTML elements (content, padding, border, margin)",
          "A way to organize CSS files",
          "A JavaScript library"
        ],
        correctAnswer: 1,
        explanation: "The CSS box model describes how elements are structured with content, padding, border, and margin."
      },
      {
        question: "Which JavaScript framework is developed by Facebook?",
        options: ["Angular", "Vue", "React", "Svelte"],
        correctAnswer: 2,
        explanation: "React is a JavaScript framework developed and maintained by Facebook."
      },
      {
        question: "What is responsive web design?",
        options: [
          "Design that responds to user clicks",
          "Design that adapts to different screen sizes",
          "Design that loads quickly",
          "Design with animations"
        ],
        correctAnswer: 1,
        explanation: "Responsive web design ensures websites work well on all devices and screen sizes."
      },
      {
        question: "Which CSS property is used to create flexbox layouts?",
        options: ["position: flex", "display: flex", "layout: flexbox", "flex: true"],
        correctAnswer: 1,
        explanation: "display: flex enables flexbox layout for an element and its children."
      },
      {
        question: "What is the purpose of Git version control?",
        options: [
          "To track changes in code over time",
          "To style websites",
          "To optimize performance",
          "To create animations"
        ],
        correctAnswer: 0,
        explanation: "Git is a version control system that tracks changes in code over time."
      },
      {
        question: "Which HTML attribute is used to define inline styles?",
        options: ["class", "style", "css", "design"],
        correctAnswer: 1,
        explanation: "The style attribute is used to apply inline CSS styles directly to HTML elements."
      }
    ],
    'AI/ML Engineer': [
      {
        question: "What is the difference between supervised and unsupervised learning?",
        options: [
          "Speed of training",
          "Presence of labeled data",
          "Algorithm complexity",
          "Hardware requirements"
        ],
        correctAnswer: 1,
        explanation: "Supervised learning uses labeled data, while unsupervised learning works with unlabeled data."
      },
      {
        question: "Which neural network architecture is best for image processing?",
        options: ["RNN", "LSTM", "CNN", "Transformer"],
        correctAnswer: 2,
        explanation: "Convolutional Neural Networks (CNNs) are specifically designed for image processing tasks."
      },
      {
        question: "What is backpropagation in neural networks?",
        options: [
          "A way to backup the network",
          "An algorithm to train neural networks by calculating gradients",
          "A method to visualize networks",
          "A type of activation function"
        ],
        correctAnswer: 1,
        explanation: "Backpropagation is the fundamental algorithm used to train neural networks."
      },
      {
        question: "Which technique helps prevent vanishing gradients in deep networks?",
        options: ["Dropout", "Batch Normalization", "ReLU activation", "All of the above"],
        correctAnswer: 3,
        explanation: "All these techniques help address the vanishing gradient problem in deep networks."
      },
      {
        question: "What is the purpose of the attention mechanism in transformers?",
        options: [
          "To draw attention to important features",
          "To weigh the importance of different input tokens",
          "To speed up training",
          "To reduce memory usage"
        ],
        correctAnswer: 1,
        explanation: "Attention mechanisms help models focus on relevant parts of the input sequence."
      },
      {
        question: "Which evaluation metric is commonly used for classification tasks?",
        options: ["MSE", "MAE", "F1 Score", "R-squared"],
        correctAnswer: 2,
        explanation: "F1 Score is a common metric for evaluating classification model performance."
      },
      {
        question: "What is transfer learning?",
        options: [
          "Learning to transfer files",
          "Using knowledge from one task to improve another",
          "Moving data between servers",
          "Converting between formats"
        ],
        correctAnswer: 1,
        explanation: "Transfer learning leverages knowledge from pre-trained models for new tasks."
      },
      {
        question: "Which algorithm is used for dimensionality reduction?",
        options: ["Random Forest", "SVM", "PCA", "KNN"],
        correctAnswer: 2,
        explanation: "Principal Component Analysis (PCA) is a popular dimensionality reduction technique."
      },
      {
        question: "What is the purpose of dropout in neural networks?",
        options: [
          "To drop connections permanently",
          "To prevent overfitting by randomly dropping neurons",
          "To speed up inference",
          "To reduce model size"
        ],
        correctAnswer: 1,
        explanation: "Dropout randomly deactivates neurons during training to prevent overfitting."
      },
      {
        question: "Which framework is developed by Google for deep learning?",
        options: ["PyTorch", "TensorFlow", "Keras", "Caffe"],
        correctAnswer: 1,
        explanation: "TensorFlow is Google's open-source deep learning framework."
      }
    ]
  };

  // Initialize questions when modal opens
  useEffect(() => {
    if (isOpen) {
      generateQuestions();
    }
  }, [isOpen, userRole]);

  const generateQuestions = () => {
    const bank = questionBanks[userRole] || questionBanks['Data Scientist'];
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    
    const questionsWithIds = selected.map((q, index) => ({
      ...q,
      id: index + 1
    }));
    
    setQuestions(questionsWithIds);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setScore(0);
    setAnswers([]);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        saveQuizResult(score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0));
      }
    }
  };

  const saveQuizResult = (finalScore: number) => {
    const level = finalScore <= 3 ? 'Beginner' : finalScore <= 7 ? 'Intermediate' : 'Expert';
    const result: QuizResult = {
      score: finalScore,
      max_score: questions.length,
      topic: userRole || 'General',
      level,
      date: new Date().toISOString()
    };
    
    // Save to test_history localStorage
    const existingResults = JSON.parse(localStorage.getItem('test_history') || '[]');
    existingResults.push(result);
    localStorage.setItem('test_history', JSON.stringify(existingResults));
    
    // Show completion toast and redirect to dashboard
    setTimeout(() => {
      alert('Assessment Complete! Check your Dashboard for results.');
      navigate('/dashboard');
      onClose();
    }, 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-yellow-400';
      case 'Intermediate': return 'text-blue-400';
      case 'Expert': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Beginner': return <AlertCircle className="h-6 w-6" />;
      case 'Intermediate': return <Brain className="h-6 w-6" />;
      case 'Expert': return <Trophy className="h-6 w-6" />;
      default: return <Brain className="h-6 w-6" />;
    }
  };

  const calculateLevel = (score: number) => {
    return score <= 3 ? 'Beginner' : score <= 7 ? 'Intermediate' : 'Expert';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-purple-400/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
                {userRole} Skill Assessment
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {!quizCompleted ? (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>Score: {score}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              {questions[currentQuestion] && (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {questions[currentQuestion].question}
                    </h3>
                    
                    {/* Options */}
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showFeedback}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                            showFeedback
                              ? index === questions[currentQuestion].correctAnswer
                                ? 'bg-green-500/20 border-green-400 text-green-400'
                                : index === selectedAnswer
                                ? 'bg-red-500/20 border-red-400 text-red-400'
                                : 'bg-gray-700/50 border-gray-600 text-gray-400'
                              : selectedAnswer === index
                              ? 'bg-purple-500/20 border-purple-400 text-purple-400'
                              : 'bg-white/5 border-gray-600 text-gray-300 hover:bg-white/10 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showFeedback && index === questions[currentQuestion].correctAnswer && (
                              <CheckCircle className="h-5 w-5" />
                            )}
                            {showFeedback && index === selectedAnswer && index !== questions[currentQuestion].correctAnswer && (
                              <AlertCircle className="h-5 w-5" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explanation (shown after selection) */}
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl"
                    >
                      <p className="text-blue-300 text-sm">
                        {questions[currentQuestion].explanation}
                      </p>
                    </motion.div>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {showResult ? 'Next Question' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div className="text-center space-y-6">
              <div className="bg-white/5 rounded-2xl p-8">
                <div className="flex justify-center mb-4">
                  {getLevelIcon(calculateLevel(score))}
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Quiz Completed!
                </h3>
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {score}/{questions.length}
                </div>
                <div className={`text-xl font-semibold ${getLevelColor(calculateLevel(score))}`}>
                  Level: {calculateLevel(score)}
                </div>
                <p className="text-gray-300 mt-4">
                  {calculateLevel(score) === 'Beginner' && "Keep practicing! You're building a strong foundation."}
                  {calculateLevel(score) === 'Intermediate' && "Great job! You have solid knowledge in this area."}
                  {calculateLevel(score) === 'Expert' && "Excellent! You have mastered this topic."}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={generateQuestions}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizModal;
