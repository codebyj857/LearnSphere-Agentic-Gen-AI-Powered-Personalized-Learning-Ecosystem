from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import socket
import time
import sqlite3
from datetime import datetime
from contextlib import contextmanager
from dotenv import load_dotenv
import threading
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import uuid
import json
from typing import Dict, List, Optional

# Import verified resources manager
from verified_resources_manager import get_resources_manager, get_roadmap_with_resources

genai = None
try:
    import google.genai as genai
except Exception as e:
    print(f"[ERROR] Gemini AI import failed: {e}")

load_dotenv()

app = Flask(__name__)
# Bulletproof CORS configuration
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://192.168.1.5:3000",
    "http://192.168.1.5:3001"
]
CORS(app, resources={r"/*": {"origins": allowed_origins, "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}}, supports_credentials=True)

# Database configuration with connection pooling
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///learnsphere.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_size': 10,
    'max_overflow': 20
}
db = SQLAlchemy(app)

# Database connection retry decorator
def db_retry(max_retries=3, delay=0.1):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return f(*args, **kwargs)
                except sqlite3.OperationalError as e:
                    if "database is locked" in str(e).lower() and attempt < max_retries - 1:
                        time.sleep(delay * (2 ** attempt))  # Exponential backoff
                        continue
                    raise
                except Exception as e:
                    if attempt < max_retries - 1:
                        time.sleep(delay)
                        continue
                    raise
            return None
        return decorated_function
    return decorator

# Global error handler
@app.errorhandler(Exception)
def handle_global_error(error):
    print(f"Global Error Handler: {type(error).__name__}: {str(error)}")
    return jsonify({
        'error': 'An unexpected error occurred',
        'type': type(error).__name__,
        'message': str(error),
        'timestamp': datetime.now().isoformat()
    }), 500

# User Model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'is_active': self.is_active
        }

# UserFeedback Model
class UserFeedback(db.Model):
    __tablename__ = 'user_feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    course_studied = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    feedback = db.Column(db.Text, nullable=False)
    completion_date = db.Column(db.DateTime)
    improvement_percentage = db.Column(db.Float, nullable=True)
    time_spent_hours = db.Column(db.Float, nullable=True)
    pre_test_score = db.Column(db.Integer, nullable=True)
    post_test_score = db.Column(db.Integer, nullable=True)
    learning_path = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
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
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'is_anonymous': self.is_anonymous
        }

# Gemini AI Setup - with robust fallback
api_key = os.getenv("GOOGLE_API_KEY")
model = None

# Try to import google.generativeai properly
genai_module = None
try:
    import google.generativeai as genai_module
except Exception as e:
    print(f"[WARN] google.generativeai not available: {e}")

# Configure Gemini if available
if api_key and genai_module:
    try:
        genai_module.configure(api_key=api_key)
        model = genai_module.GenerativeModel('models/gemini-1.5-flash')
        print("[OK] Gemini AI Connected")
    except Exception as e:
        print(f"[ERROR] Gemini AI Connection Error: {e}")
        print("ℹ️  Using fallback chatbot mode")
elif api_key:
    print("⚠️  GOOGLE_API_KEY set but google.generativeai not available")
else:
    print("ℹ️  No GOOGLE_API_KEY found; using fallback chatbot")

# Fallback Chatbot Responses Dictionary
FALLBACK_RESPONSES = {
    "web": "Web development is fantastic! Learn HTML, CSS, JavaScript, React or Vue. Start with fundamentals and build real projects.",
    "data": "Data science blends statistics and coding. Master Python, SQL, scikit-learn, pandas, and practice with real datasets.",
    "ai": "AI/ML is booming! Learn Python, TensorFlow/PyTorch, understand algorithms, and work on projects.",
    "mobile": "Mobile development rocks! Choose native (Swift/iOS, Kotlin/Android) or cross-platform (React Native, Flutter).",
    "backend": "Backend powers apps. Learn Python/Node.js/Go, databases (SQL/NoSQL), and API design.",
    "career": "Build skills progressively. Do internships, contribute to open source, and network.",
    "learn": "Consistency beats everything. Use courses, read docs, build projects, maintain GitHub portfolio.",
    "path": "Tailor your path to goals. Fundamentals → Projects → Specialization.",
    "python": "Python is versatile! Use for web, data, automation, or AI. Master basics first.",
    "javascript": "JavaScript powers web! Learn ES6+, React/Vue, DOM manipulation.",
    "project": "Start small, build real projects, commit to GitHub, make your portfolio shine!",
}

def get_fallback_response(user_message: str) -> str:
    """Generate intelligent fallback responses"""
    msg_lower = user_message.lower().strip()
    
    # Check keyword matches
    for keyword, response in FALLBACK_RESPONSES.items():
        if keyword in msg_lower:
            return f"💡 {response}"
    
    # Greeting
    if any(word in msg_lower for word in ["hello", "hi", "hey"]):
        return "👋 Hi there! I'm LearnSphere's Career Mentor. Ask me about programming, learning paths, careers in tech!"
    
    # Help
    if any(word in msg_lower for word in ["help", "what can", "capabilities"]):
        return "📚 I guide on tech careers, programming languages, learning strategies, and career paths!"
    
    # Projects
    if any(word in msg_lower for word in ["portfolio", "github", "resume"]):
        return "🚀 Build projects, use GitHub, showcase work. A strong portfolio beats resumes!"
    
    # Time
    if any(word in msg_lower for word in ["time", "how long", "takes"]):
        return "⏱️  Basic skills: 3-6 months. Professional: 1-2 years. Mastery: ongoing. Stay consistent!"
    
    # Default
    return "🤔 Great question! Tell me more specifically what you're interested in, and I'll guide you!"

# User Feedback Routes
@app.route('/api/user-feedbacks', methods=['GET'])
@db_retry(max_retries=3)
def get_user_feedbacks():
    """Get all user feedbacks for display"""
    try:
        feedbacks = UserFeedback.query.order_by(UserFeedback.created_at.desc()).all()
        return jsonify([feedback.to_dict() for feedback in feedbacks])
    except Exception as e:
        print(f"Error in get_user_feedbacks: {str(e)}")
        return jsonify({'error': 'Failed to fetch feedbacks', 'details': str(e)}), 500

@app.route('/api/user-feedback', methods=['POST'])
@db_retry(max_retries=3)
def add_user_feedback():
    """Add new user feedback"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['course_studied', 'rating', 'feedback']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate rating range
        if not isinstance(data['rating'], int) or data['rating'] < 1 or data['rating'] > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
        
        # Generate anonymous user ID if not provided
        user_count = UserFeedback.query.count()
        user_id = data.get('user_id', f'User {user_count + 1}')
        
        feedback = UserFeedback(
            user_id=user_id,
            course_studied=data['course_studied'],
            rating=data['rating'],
            feedback=data['feedback'],
            completion_date=datetime.fromisoformat(data['completion_date']) if data.get('completion_date') else None,
            improvement_percentage=data.get('improvement_percentage'),
            time_spent_hours=data.get('time_spent_hours'),
            pre_test_score=data.get('pre_test_score'),
            post_test_score=data.get('post_test_score'),
            learning_path=data.get('learning_path'),
            is_anonymous=data.get('is_anonymous', True)
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify(feedback.to_dict()), 201
    except Exception as e:
        print(f"Error in add_user_feedback: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to add feedback', 'details': str(e)}), 500

@app.route('/api/user-feedback-stats', methods=['GET'])
@db_retry(max_retries=3)
def get_feedback_stats():
    """Get feedback statistics"""
    try:
        total_feedbacks = UserFeedback.query.count()
        avg_rating = db.session.query(db.func.avg(UserFeedback.rating)).scalar() or 0
        avg_improvement = db.session.query(db.func.avg(UserFeedback.improvement_percentage)).scalar() or 0
        
        # Rating distribution
        rating_dist = db.session.query(
            UserFeedback.rating,
            db.func.count(UserFeedback.id)
        ).group_by(UserFeedback.rating).all()
        
        # Course distribution
        course_dist = db.session.query(
            UserFeedback.course_studied,
            db.func.count(UserFeedback.id)
        ).group_by(UserFeedback.course_studied).all()
        
        return jsonify({
            'total_feedbacks': total_feedbacks,
            'average_rating': round(float(avg_rating), 2),
            'average_improvement': round(float(avg_improvement), 2),
            'rating_distribution': {str(k): v for k, v in rating_dist},
            'course_distribution': {k: v for k, v in course_dist}
        })
    except Exception as e:
        print(f"Error in get_feedback_stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch statistics', 'details': str(e)}), 500

@app.route('/load-sample-data', methods=['POST'])
@db_retry(max_retries=3)
def load_sample_data():
    """Load sample feedback data from JSON file"""
    try:
        import json
        from datetime import datetime
        
        # Load sample data
        json_path = os.path.join(os.path.dirname(__file__), 'static', 'plots', 'user_feedbacks.json')
        
        if not os.path.exists(json_path):
            return jsonify({'error': 'Sample data file not found', 'path': json_path}), 404
        
        with open(json_path, 'r') as f:
            sample_data = json.load(f)
        
        # Clear existing data
        UserFeedback.query.delete()
        db.session.commit()
        
        # Load sample data
        loaded_count = 0
        for data in sample_data:
            try:
                feedback = UserFeedback(
                    user_id=data['user_id'],
                    course_studied=data['course_studied'],
                    rating=data['rating'],
                    feedback=data['feedback'],
                    completion_date=datetime.fromisoformat(data['completion_date']) if data.get('completion_date') else None,
                    improvement_percentage=data.get('improvement_percentage'),
                    time_spent_hours=data.get('time_spent_hours'),
                    pre_test_score=data.get('pre_test_score'),
                    post_test_score=data.get('post_test_score'),
                    learning_path=data.get('learning_path'),
                    is_anonymous=True
                )
                db.session.add(feedback)
                loaded_count += 1
            except Exception as e:
                print(f"Error loading feedback {data.get('user_id', 'unknown')}: {str(e)}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully loaded {loaded_count} sample feedbacks',
            'count': loaded_count,
            'total_in_file': len(sample_data)
        })
    except Exception as e:
        print(f"Error in load_sample_data: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to load sample data', 'details': str(e)}), 500

# Original Routes
@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "active"}), 200

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'], endpoint='auth_login')
def auth_login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.json
    return jsonify({"token": "demo-token", "user": {"username": data.get('username')}}), 200

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.json
    return jsonify({"token": "demo-token", "user": {"username": data.get('username')}}), 200

@app.route('/api/user/<int:user_id>/roles', methods=['POST', 'OPTIONS'])
def add_user_role(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.json
    return jsonify({"success": True, "message": f"Role {data.get('role_name')} added successfully"}), 200

@app.route('/api/survey/results/<int:user_id>', methods=['GET', 'OPTIONS'])
def get_survey_results(user_id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    return jsonify({
        "success": True, 
        "survey": {
            "user_level": "Intermediate",
            "recommended_roles": ["Data Scientist", "Web Developer"]
        }
    }), 200

# Authentication routes
@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data or 'name' not in data:
            return jsonify({
                'error': 'Name, email and password are required',
                'suggestion': 'Please fill in all required fields: full name, email address, and a strong password.'
            }), 400
            
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'error': 'User with this email already exists',
                'suggestion': 'Try signing in with this email, or use a different email to create a new account.'
            }), 409
            
        # Create new user
        password_hash = generate_password_hash(password)
        user = User(
            name=name,
            email=email,
            password_hash=password_hash
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'email': email
        }, os.getenv('SECRET_KEY', 'learnsphere-secret'), algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except Exception as e:
        print(f"Signup Error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create user',
            'suggestion': 'Check your information and try again, or contact support if the issue persists.',
            'details': str(e)
        }), 500

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'error': 'Email and password are required',
                'suggestion': 'Please enter both your registered email and password to sign in.'
            }), 400
            
        email = data['email'].strip().lower()
        password = data['password']
        
        # Find user
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({
                'error': 'Invalid email or password',
                'suggestion': 'Verify that your login credentials are correct, or sign up if you do not have an account yet.'
            }), 401
            
        # Update last login
        user.last_login = datetime.now()
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'email': email
        }, os.getenv('SECRET_KEY', 'learnsphere-secret'), algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Login Error: {str(e)}")
        return jsonify({
            'error': 'Login failed',
            'suggestion': 'Try again, and if this continues, contact support or reset your password if needed.',
            'details': str(e)
        }), 500

@app.route('/api/roadmap/generate', methods=['POST', 'OPTIONS'])
def generate_roadmap():
    """Generate a learning roadmap with verified YouTube and PDF resources"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        if not data or 'career_path' not in data:
            return jsonify({'error': 'Career path is required'}), 400
            
        career_path = data['career_path'].strip()
        
        # 🎯 STEP 1: Try to get verified resources first
        resources_manager = get_resources_manager()
        verified_roadmap = get_roadmap_with_resources(career_path)
        
        if verified_roadmap:
            print(f"[OK] Loaded verified roadmap for: {career_path}")
            return jsonify({
                "message": "Roadmap generated from verified resources",
                "source": "verified",
                "roadmap": verified_roadmap
            }), 200
        
        # 🤖 STEP 2: Fallback to AI if no verified resources found
        print(f"[WARN] No verified resources found for '{career_path}', trying AI generation...")
        
        if not model:
            # If no AI available, use generic fallback
            print(f"[INFO] AI model not available, using generic fallback")
            fallback_roadmap = generate_fallback_roadmap(career_path)
            return jsonify({
                "message": "Roadmap generated from generic template",
                "source": "fallback",
                "roadmap": fallback_roadmap
            }), 200
        
        # Generate with AI if available
        # HEURISTIC ROUTING: Strictly forbid hallucinated direct links.
        # The model may ONLY emit clean, safe search operators. The final
        # URLs are resolved server-side from verified_resources.json, and
        # any skill without a verified link gets a safe search fallback.
        prompt = f"""You are LearnSphere's elite AI Career Mentor. Generate a comprehensive learning roadmap for someone who wants to become a {career_path}.

Generate EXACTLY 5 steps (no more, no less) with structured skill topics.

HARD RULES (anti-hallucination heuristic routing):
- NEVER output full/complete URLs or web addresses. You cannot know real links.
- NEVER invent https:// links, video IDs, or page paths.
- For EVERY step you MUST output clean search operators instead of raw links:
  * "youtube_query": a plain topic phrase for YouTube (e.g. "python full course tutorial")
  * "pdf_query": a plain topic phrase for PDF/docs (e.g. "python documentation guide pdf")
- Keep each query under ~8 words, lowercase, no special chars, no "https".

Format as JSON:
{{
  "roadmap": [
    {{
      "step": 1,
      "title": "Skill title",
      "description": "What they learn",
      "skill": "Skill topic",
      "youtube_query": "skill full course tutorial",
      "pdf_query": "skill documentation guide pdf",
      "duration": "2 weeks"
    }}
  ]
}}

Generate for: {career_path}"""

        response = model.generate_content(prompt)
        
        # Parse JSON response
        import re
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            roadmap_data = json.loads(json_match.group())
            roadmap = roadmap_data.get("roadmap", [])
            
            # HEURISTIC RESOURCE RESOLUTION:
            # For each step, prefer a verified direct URL from the curated
            # database; otherwise construct a guaranteed-safe search link.
            for idx, step in enumerate(roadmap, 1):
                if 'step' not in step:
                    step['step'] = idx
                topic = step.get('skill') or step.get('title') or ''
                step['skill'] = topic
                verified = resources_manager.get_skill_resources(topic) if topic else None
                yt_query = step.get('youtube_query') or f"{topic.lower()} full course tutorial"
                pdf_query = step.get('pdf_query') or f"{topic.lower()} documentation guide pdf"
                step['youtube'] = (verified or {}).get('youtube') or _safe_youtube_url(yt_query)
                step['youtube_title'] = (verified or {}).get('youtube_title') or f"{topic} Tutorial"
                step['pdf'] = (verified or {}).get('pdf') or _safe_pdf_url(pdf_query)
                step['pdf_title'] = (verified or {}).get('pdf_title') or f"{topic} Resources"
                step.pop('youtube_query', None)
                step.pop('pdf_query', None)
            
            return jsonify({
                "message": "Roadmap generated by AI",
                "source": "ai",
                "roadmap": roadmap
            }), 200
        else:
            return jsonify({
                "error": "Could not parse AI response",
                "source": "error"
            }), 500
            
    except Exception as e:
        print(f"[ERROR] Roadmap Generation Error: {str(e)}")
        # Return safe fallback
        return jsonify({
            "message": "Roadmap generated from template",
            "source": "fallback",
            "roadmap": generate_fallback_roadmap(data.get('career_path', 'Software Developer'))
        }), 200


def _clean_search_query(query: str) -> str:
    """Normalize a search phrase into a safe, URL-friendly query string."""
    import re as _re
    cleaned = _re.sub(r'[^a-zA-Z0-9\s]', '', query or '').strip().lower()
    if not cleaned:
        cleaned = 'programming tutorial'
    return '+'.join(cleaned.split())


def _safe_youtube_url(query: str) -> str:
    """Construct a guaranteed-safe YouTube search URL (never 404s)."""
    from urllib.parse import quote
    search = _clean_search_query(query)
    if not search.endswith('course') and not search.endswith('tutorial'):
        search = f"{search}+course"
    return f"https://www.youtube.com/results?search_query={quote(search)}"


def _safe_pdf_url(query: str) -> str:
    """Construct a guaranteed-safe scholarly/PDF search URL (never 404s)."""
    from urllib.parse import quote
    search = _clean_search_query(query)
    if not search.endswith('pdf') and not search.endswith('documentation'):
        search = f"{search}+pdf"
    return f"https://scholar.google.com/scholar?q={quote(search)}"


def generate_fallback_roadmap(career_path: str) -> List[Dict]:
    """Generate a fallback roadmap with verified resources"""
    resources_manager = get_resources_manager()
    
    # Generic career skills mapping
    career_skills_map = {
        'software developer': ['Python', 'Data Structures', 'Web Development', 'System Design', 'REST APIs'],
        'full stack developer': ['JavaScript', 'React', 'SQL', 'Flask', 'Docker'],
        'data scientist': ['Python', 'SQL', 'Machine Learning', 'Data Science', 'AI & Deep Learning'],
        'frontend developer': ['CSS & Tailwind', 'JavaScript', 'React', 'TypeScript', 'Web Development'],
        'backend developer': ['Python', 'Data Structures', 'SQL', 'REST APIs', 'System Design'],
        'devops engineer': ['Docker', 'Git & Version Control', 'Cloud Computing', 'DevOps'],
    }
    
    # Get skills for this career, or use generic
    skills = None
    for career_key, career_skills in career_skills_map.items():
        if career_key.lower() in career_path.lower():
            skills = career_skills
            break
    
    if not skills:
        skills = ['Python', 'Data Structures', f'{career_path} Fundamentals', f'{career_path} Advanced Topics', f'{career_path} Projects']
    
    # Build roadmap with verified resources
    roadmap = []
    for i, skill in enumerate(skills[:5], 1):
        resources = resources_manager.get_skill_resources(skill)
        
        if resources:
            step = {
                'step': i,
                'title': f"{skill} Mastery",
                'description': f"Learn and master {skill} fundamentals and advanced concepts",
                'skill': skill,
                'duration': '2 weeks',
                'youtube': resources.get('youtube', ''),
                'youtube_title': resources.get('youtube_title', f'{skill} Tutorial'),
                'pdf': resources.get('pdf', ''),
                'pdf_title': resources.get('pdf_title', f'{skill} Resources'),
            }
        else:
            # Generic step if skill not in database
            step = {
                'step': i,
                'title': f"{skill} Foundations",
                'description': f"Master the fundamentals of {skill}",
                'skill': skill,
                'duration': '2 weeks',
                'youtube': _safe_youtube_url(skill),
                'youtube_title': f'{skill} Tutorial Video',
                'pdf': _safe_pdf_url(skill),
                'pdf_title': f'{skill} Course Materials',
            }
        
        roadmap.append(step)
    
    return roadmap


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
            
        user_msg = data.get('message', '').strip()
        
        if not user_msg:
            return jsonify({"response": "Please ask me something! I'm here to help with your career path."}), 200
        
        # Try Gemini AI first if available
        if model and api_key:
            try:
                prompt = f"You are LearnSphere's elite AI Career Mentor. Be highly structured, accurate, and deeply knowledgeable about career paths and learning. Keep responses concise and actionable. User asks: {user_msg}"
                response = model.generate_content(prompt, timeout=15)
                return jsonify({"response": response.text}), 200
            except Exception as e:
                print(f"Gemini API Error: {str(e)}")
                # Fall back to fallback responses
        
        # Fallback: Use intelligent fallback responses
        fallback_response = get_fallback_response(user_msg)
        return jsonify({"response": fallback_response}), 200
        
    except Exception as e:
        print(f"Chatbot Error: {str(e)}")
        return jsonify({"response": f"I'm having a moment—try asking me another question! Error: {str(e)[:50]}"}), 200

# Database migration function
def migrate_database():
    """Safely migrate the database schema"""
    try:
        # Check if name column exists in users table
        with db.engine.connect() as conn:
            result = conn.execute(db.text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'name' not in columns:
                print("🔄 Adding 'name' column to users table...")
                conn.execute(db.text("ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT ''"))
                conn.commit()
                print("[OK] Successfully added 'name' column")
            else:
                print("[OK] 'name' column already exists")
                
    except Exception as e:
        print(f"[ERROR] Migration error: {e}")
        print("⚠️  Please delete the old database file and restart the server")

def find_free_port(start_port: int = 5001, max_port: int = 5100) -> int:
    port = start_port
    while port <= max_port:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(('0.0.0.0', port))
                return port
            except OSError:
                port += 1
    raise RuntimeError('No available port found between %d and %d' % (start_port, max_port))

# Production-ready startup
if __name__ == '__main__':
    # Get port from environment variable or default to API_PORT or 5001
    port = int(os.environ.get('PORT') or os.environ.get('API_PORT') or 5001)
    port = find_free_port(port)
    
    # Initialize database
    with app.app_context():
        db.create_all()
        migrate_database()  # Run migrations
    
    print(f"[START] Starting LearnSphere Backend on port {port}")
    print(f"[URL] Accessible at: http://localhost:{port}")
    print(f"[DOCS] API Documentation: http://localhost:{port}/api")
    
    # Run with production-ready settings
    app.run(
        debug=os.environ.get('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=port,
        threaded=True
    )
