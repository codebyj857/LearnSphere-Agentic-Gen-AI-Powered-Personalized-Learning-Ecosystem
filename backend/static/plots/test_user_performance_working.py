import matplotlib.pyplot as plt
import numpy as np

# Generate realistic test user performance data
np.random.seed(42)
test_users = [
    'alice_chen_2024', 'bob_smith_2024', 'charlie_johnson_2024', 
    'diana_martinez_2024', 'evan_wilson_2024', 'fiona_davis_2024',
    'george_brown_2024', 'hannah_miller_2024', 'ian_taylor_2024',
    'julia_anderson_2024', 'kevin_thomas_2024', 'laura_jackson_2024'
]

# Performance metrics
pre_test_scores = [78, 85, 92, 73, 88, 95, 82, 79, 91, 87]
post_test_scores = [85, 92, 88, 79, 94, 89, 86, 93, 85, 90]
improvement_rates = [8.9, 7.7, -4.3, 8.2, 6.8, -6.0, 4.1, -0.9, 2.1, 3.0]
time_spent_hours = [15.2, 18.5, 22.1, 14.8, 19.7, 25.3, 16.9, 28.4, 20.2, 31.6, 24.8]
learning_paths = ['Data Scientist', 'AI Researcher', 'Machine Learning Engineer', 'Full Stack Developer']

# Create figure with white background
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
fig.patch.set_facecolor('white')
fig.suptitle('LearnSphere Test User Performance Analysis', fontsize=18, fontweight='bold', color='black')

# Pre vs Post Test Scores
x = np.arange(len(test_users))
width = 0.35

bars1 = ax1.bar(x - width/2, pre_test_scores, width, label='Pre-Test', color='#3b82f6', alpha=0.8)
bars2 = ax1.bar(x + width/2, post_test_scores, width, label='Post-Test', color='#8b5cf6', alpha=0.8)

ax1.set_title('Pre vs Post Test Scores', fontsize=14, fontweight='bold')
ax1.set_ylabel('Test Score', fontsize=12)
ax1.set_xlabel('Test Users', fontsize=12)
ax1.set_xticks(x)
ax1.set_xticklabels(test_users, rotation=45, ha='right')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Add value labels on bars
for i, (user, pre, post) in enumerate(zip(test_users, pre_test_scores, post_test_scores)):
    ax1.text(i - width/2, pre + 1, f'{pre}', ha='center', va='bottom', fontweight='bold', fontsize=8)
    ax1.text(i + width/2, post + 1, f'{post}', ha='center', va='bottom', fontweight='bold', fontsize=8)

# Improvement Rates
ax2.bar(test_users, improvement_rates, color='#10b981', alpha=0.8)
ax2.set_title('Individual Improvement Rates (%)', fontsize=14, fontweight='bold')
ax2.set_ylabel('Improvement Rate (%)', fontsize=12)
ax2.set_xlabel('Test Users', fontsize=12)
ax2.tick_params(axis='x', rotation=45)
ax2.grid(True, alpha=0.3)

# Add value labels
for i, bar in enumerate(ax2.patches):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, height + 0.5, 
             f'{height:.1f}%', ha='center', va='bottom', fontweight='bold')

# Time Spent vs Performance
ax3.scatter(time_spent_hours, post_test_scores, s=120, alpha=0.7, c='#f59e0b', edgecolors='black', linewidth=2)
ax3.set_title('Time Investment vs Performance', fontsize=14, fontweight='bold')
ax3.set_xlabel('Time Spent (hours)', fontsize=12)
ax3.set_ylabel('Post-Test Score', fontsize=12)
ax3.grid(True, alpha=0.3)

# Add trend line
z = np.polyfit(time_spent_hours, post_test_scores, 1)
p = np.poly1d(z)
ax3.plot(range(10, 35), p(range(10, 35)), "r--", alpha=0.8, linewidth=2)

# Learning Path Distribution
path_counts = [learning_paths.count(path) for path in learning_paths]
ax4.pie(path_counts, labels=learning_paths, autopct='%1.1f%%', 
         colors=['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], 
         shadow=True, startangle=90)
ax4.set_title('Learning Path Distribution', fontsize=14, fontweight='bold')

plt.tight_layout()
plt.savefig('test_user_performance_working.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print("Generated test_user_performance_working.png")
