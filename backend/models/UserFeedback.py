from datetime import datetime

# Import db from app - this will be set after app initialization
db = None

def init_db(database):
    global db
    db = database

class UserFeedback(db.Model):
    __tablename__ = 'user_feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    course_studied = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    feedback = db.Column(db.Text, nullable=False)
    completion_date = db.Column(db.DateTime, default=datetime.utcnow)
    improvement_percentage = db.Column(db.Float, nullable=True)
    time_spent_hours = db.Column(db.Float, nullable=True)
    pre_test_score = db.Column(db.Integer, nullable=True)
    post_test_score = db.Column(db.Integer, nullable=True)
    learning_path = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_anonymous = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_studied': self.course_studied,
            'rating': self.rating,
            'feedback': self.feedback,
            'completion_date': self.completion_date.strftime('%Y-%m-%d') if self.completion_date else None,
            'improvement_percentage': self.improvement_percentage,
            'time_spent_hours': self.time_spent_hours,
            'pre_test_score': self.pre_test_score,
            'post_test_score': self.post_test_score,
            'learning_path': self.learning_path,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_anonymous': self.is_anonymous
        }
    
    def __repr__(self):
        return f'<UserFeedback {self.user_id} - {self.course_studied}>'
