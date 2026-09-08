import json
import random
from datetime import datetime, timedelta

# Generate 15 sample user feedbacks with course data
courses_offered = [
    "Python Fundamentals", "Data Science Basics", "Web Development", 
    "Machine Learning", "AI Ethics", "Career Planning", 
    "React Development", "Database Design", "Cloud Computing"
]

feedback_templates = [
    "Excellent course! The content was well-structured and easy to follow. I learned so much about {course}.",
    "Great learning experience. The instructor explained {course} concepts clearly with practical examples.",
    "The {course} course exceeded my expectations. Hands-on projects really helped solidify my understanding.",
    "Very comprehensive coverage of {course}. The pacing was perfect for beginners like me.",
    "Outstanding platform! {course} gave me the confidence to pursue a career in tech.",
    "The interactive elements in {course} made learning engaging and effective.",
    "I appreciated the real-world applications in {course}. It connected theory to practice perfectly.",
    "Fantastic course! {course} provided exactly what I needed to advance my skills.",
    "The support system was excellent throughout the {course} program. Highly recommend!",
    "{course} transformed my understanding of the subject. The quality of content is superb."
]

sample_feedbacks = []

for i in range(1, 16):
    # Random course selection
    course = random.choice(courses_offered)
    
    # Random rating (weighted towards higher scores for realistic positive feedback)
    rating_weights = [1, 2, 3, 4, 5, 5, 5, 4, 5, 4]  # More 4s and 5s
    rating = random.choice(rating_weights)
    
    # Random feedback template
    feedback_text = random.choice(feedback_templates).format(course=course)
    
    # Random completion date within last 6 months
    days_ago = random.randint(1, 180)
    completion_date = datetime.now() - timedelta(days=days_ago)
    
    # Random improvement score
    improvement = round(random.uniform(5, 45), 1)
    
    # Random time spent
    time_spent = round(random.uniform(8, 45), 1)
    
    feedback_data = {
        "user_id": f"User {i}",
        "course_studied": course,
        "rating": rating,
        "feedback": feedback_text,
        "completion_date": completion_date.strftime("%Y-%m-%d"),
        "improvement_percentage": improvement,
        "time_spent_hours": time_spent,
        "pre_test_score": random.randint(45, 75),
        "post_test_score": random.randint(75, 95),
        "learning_path": random.choice(["Data Scientist", "Web Developer", "AI Engineer", "Cloud Architect"])
    }
    
    sample_feedbacks.append(feedback_data)

# Save to JSON file
with open('user_feedbacks.json', 'w') as f:
    json.dump(sample_feedbacks, f, indent=2)

print("Generated 15 sample user feedbacks with course data")
print(f"Saved to user_feedbacks.json")

# Display sample data
print("\nSample User Feedbacks:")
for i, feedback in enumerate(sample_feedbacks[:5], 1):
    print(f"\n{i}. {feedback['user_id']}")
    print(f"   Course: {feedback['course_studied']}")
    print(f"   Rating: {'⭐' * feedback['rating']}")
    print(f"   Feedback: {feedback['feedback']}")
    print(f"   Improvement: {feedback['improvement_percentage']}%")
    print(f"   Time Spent: {feedback['time_spent_hours']} hours")
