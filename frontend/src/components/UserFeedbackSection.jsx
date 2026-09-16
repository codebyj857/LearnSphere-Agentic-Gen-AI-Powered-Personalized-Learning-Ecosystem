import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, TrendingUp, Clock, BookOpen, Users } from 'lucide-react';

const UserFeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/user-feedbacks');
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user-feedback-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch('/load-sample-data', { method: 'POST' });
      const data = await response.json();
      alert(data.message || 'Sample data loaded successfully');
      fetchFeedbacks();
      fetchStats();
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return 'bg-green-100 text-green-800';
    if (rating >= 4) return 'bg-blue-100 text-blue-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Feedback & Learning Analytics</h2>
          <p className="text-gray-600 mt-2">Real feedback from LearnSphere learners</p>
        </div>
        <Button onClick={loadSampleData} variant="outline">
          Load Sample Data
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_feedbacks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_rating}/5</div>
              <div className="flex mt-1">
                {renderStars(Math.round(stats.average_rating))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_improvement}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Popular Course</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {Object.keys(stats.course_distribution)[0] || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{feedback.user_id}</CardTitle>
                  <p className="text-sm text-gray-600">{feedback.course_studied}</p>
                </div>
                <Badge className={getRatingColor(feedback.rating)}>
                  {feedback.rating}/5
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(feedback.rating)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{feedback.feedback}</p>
              
              <div className="space-y-2 text-sm">
                {feedback.improvement_percentage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Improvement:</span>
                    <span className="font-semibold text-green-600">
                      +{feedback.improvement_percentage}%
                    </span>
                  </div>
                )}
                
                {feedback.time_spent_hours && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Time Spent:
                    </span>
                    <span className="font-semibold">{feedback.time_spent_hours} hrs</span>
                  </div>
                )}
                
                {feedback.pre_test_score && feedback.post_test_score && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Scores:</span>
                    <span className="font-semibold">
                      {feedback.pre_test_score} → {feedback.post_test_score}
                    </span>
                  </div>
                )}
                
                {feedback.learning_path && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Path:</span>
                    <Badge variant="outline" className="text-xs">
                      {feedback.learning_path}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                Completed: {feedback.completion_date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share your learning experience!</p>
          <Button onClick={loadSampleData}>Load Sample Data</Button>
        </div>
      )}
    </div>
  );
};

export default UserFeedbackSection;
