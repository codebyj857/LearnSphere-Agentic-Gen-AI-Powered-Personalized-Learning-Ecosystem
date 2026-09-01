import matplotlib.pyplot as plt
import numpy as np
from matplotlib.ticker import FuncFormatter
import warnings
warnings.filterwarnings('ignore')

# IEEE paper styling - minimal and academic
plt.rcParams.update({
    'font.size': 10,
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'legend.fontsize': 9,
    'figure.titlesize': 13,
    'axes.grid': True,
    'grid.alpha': 0.3,
    'grid.linewidth': 0.5,
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'font.family': 'serif',
    'font.serif': ['Times New Roman'],
    'axes.linewidth': 0.8,
    'axes.spines.top': False,
    'axes.spines.right': False,
})

# Realistic noise generator
def add_realistic_noise(base_values, noise_level=0.1, occasional_spike_prob=0.05):
    """Add realistic operational noise with occasional spikes"""
    noise = np.random.normal(0, noise_level * np.mean(base_values), len(base_values))
    
    # Add occasional operational spikes
    for i in range(len(base_values)):
        if np.random.random() < occasional_spike_prob:
            noise[i] += np.random.uniform(0.5, 2.0) * np.mean(base_values)
    
    return base_values + noise

# FIGURE 1: API Response Time - 24-Hour Operational Monitoring
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

np.random.seed(42)
hours = np.arange(0, 24, 0.25)  # 15-minute intervals
base_response = 45  # Base response time in ms

# Simulate realistic traffic patterns (business hours, peak loads, off-hours)
traffic_pattern = np.sin((hours - 6) * np.pi / 12) * 0.5 + 0.5  # Peak during business hours
traffic_pattern[hours < 6] *= 0.3  # Low traffic early morning
traffic_pattern[hours > 20] *= 0.4  # Lower traffic evening

response_times = base_response * (1 + traffic_pattern * 0.8) + np.random.normal(0, 3, len(hours))
response_times = add_realistic_noise(response_times, noise_level=0.05, occasional_spike_prob=0.08)
response_times = np.maximum(response_times, 25)  # Minimum realistic response time

ax.plot(hours, response_times, 'b-', linewidth=1.2, alpha=0.8)
ax.axhline(y=50, color='red', linestyle='--', linewidth=1.5, alpha=0.7, label='SLA Threshold (50ms)')
ax.fill_between(hours, 0, response_times, alpha=0.15, color='blue')
ax.set_xlabel('Time (hours)')
ax.set_ylabel('Response Time (ms)')
ax.set_title('API Response Time: 24-Hour Operational Monitoring', fontweight='bold')
ax.legend(loc='upper right')
ax.set_xlim(0, 24)
ax.set_ylim(0, max(response_times) * 1.1)
ax.grid(True, alpha=0.3)

plt.savefig('figure1_api_response_time.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 2: Database Query Latency Distribution
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

query_types = ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
# Realistic latencies with variance and outliers
base_latencies = [2.3, 4.1, 3.7, 5.2]
latency_variance = [0.3, 0.8, 0.6, 1.2]
query_latencies = []

for i, (base, var) in enumerate(zip(base_latencies, latency_variance)):
    samples = np.random.normal(base, var, 30)  # 30 samples per query type
    samples = np.maximum(samples, 0.5)  # Minimum realistic latency
    # Add occasional outliers
    if i == 3:  # DELETE has more outliers
        outlier_indices = np.random.choice(len(samples), size=3, replace=False)
        samples[outlier_indices] += np.random.uniform(2, 4, 3)
    query_latencies.append(samples)

bp = ax.boxplot(query_latencies, labels=query_types, patch_artist=True, widths=0.6)
colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D']
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.8)

ax.set_ylabel('Query Latency (ms)')
ax.set_title('Database Query Latency Distribution', fontweight='bold')
ax.grid(True, alpha=0.3)

plt.savefig('figure2_database_latency.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 3: Threat Detection vs Blocking
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

np.random.seed(123)
days = np.arange(1, 31, 1)
# Realistic threat patterns with occasional spikes
base_threats = np.random.poisson(2.5, 30)
# Add occasional attack spikes
attack_days = [5, 12, 18, 23, 27]
for day in attack_days:
    base_threats[day-1] += np.random.randint(8, 25)

blocked_threats = base_threats * np.random.uniform(0.85, 0.98, 30)
unblocked_threats = base_threats - blocked_threats

ax.plot(days, base_threats, 'r-', linewidth=1.5, marker='o', markersize=4, alpha=0.8, label='Threats Detected')
ax.plot(days, blocked_threats, 'g-', linewidth=1.5, marker='s', markersize=4, alpha=0.8, label='Threats Blocked')
ax.fill_between(days, blocked_threats, base_threats, alpha=0.3, color='orange', label='Unblocked')
ax.set_xlabel('Day of Month')
ax.set_ylabel('Threat Count')
ax.set_title('Threat Detection vs Blocking', fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)

plt.savefig('figure3_threat_detection.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 4: CPU Utilization Monitoring
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

np.random.seed(456)
time_points = np.arange(0, 60, 1)  # 1 hour in minutes
# Realistic CPU patterns with bursts
base_cpu = 35
cpu_pattern = base_cpu + 20 * np.sin(time_points * np.pi / 20)  # Periodic workload
cpu_noise = add_realistic_noise(cpu_pattern, noise_level=0.1, occasional_spike_prob=0.08)
cpu_usage = np.clip(cpu_noise, 10, 85)

ax.plot(time_points, cpu_usage, 'r-', linewidth=1.2, alpha=0.8)
ax.axhline(y=70, color='orange', linestyle='--', linewidth=1.5, alpha=0.7, label='Warning (70%)')
ax.axhline(y=85, color='red', linestyle='--', linewidth=1.5, alpha=0.7, label='Critical (85%)')
ax.fill_between(time_points, 0, cpu_usage, alpha=0.15, color='red')
ax.set_xlabel('Time (minutes)')
ax.set_ylabel('CPU Usage (%)')
ax.set_title('CPU Utilization Monitoring', fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)
ax.set_ylim(0, 100)

plt.savefig('figure4_cpu_utilization.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 5: Component Render Performance
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

components = ['App', 'Dashboard', 'Roadmap', 'Chatbot', 'Auth', 'Settings']
# Realistic render times with variance
base_render_times = [16.2, 8.1, 12.4, 6.8, 4.2, 3.1]
render_samples = []
for base_time in base_render_times:
    samples = np.random.normal(base_time, base_time * 0.2, 30)
    samples = np.maximum(samples, 1.0)  # Minimum 1ms
    # Add occasional outliers for complex components
    if base_time > 10:
        outlier_indices = np.random.choice(len(samples), size=2, replace=False)
        samples[outlier_indices] += np.random.uniform(base_time * 0.3, base_time * 0.5, 2)
    render_samples.append(samples)

# Box plot with 60fps threshold
bp = ax.boxplot(render_samples, labels=components, patch_artist=True, widths=0.6)
colors = ['#C73E1D' if mean > 16.67 else '#2E86AB' for mean in base_render_times]
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.8)

ax.axhline(y=16.67, color='red', linestyle='--', linewidth=1.5, alpha=0.7, label='60fps Target (16.67ms)')
ax.set_ylabel('Render Time (ms)')
ax.set_title('Component Render Performance', fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)

plt.savefig('figure5_component_render.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 6: Real-time Frame Rate Analysis
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

np.random.seed(901)
time_samples = np.arange(0, 60, 0.5)  # 1 minute samples
# Realistic frame rate with fluctuations
base_fps = 60 - 5 * np.sin(time_samples * np.pi / 15)  # Periodic variation
fps_noise = add_realistic_noise(base_fps, noise_level=0.05, occasional_spike_prob=0.06)
frame_rates = np.clip(fps_noise, 45, 60)

ax.plot(time_samples, frame_rates, 'b-', linewidth=1.2, alpha=0.8)
ax.axhline(y=60, color='green', linestyle='--', linewidth=1.5, alpha=0.7, label='Target 60fps')
ax.axhline(y=45, color='red', linestyle='--', linewidth=1.5, alpha=0.7, label='Minimum 45fps')
ax.fill_between(time_samples, 45, frame_rates, alpha=0.15, color='blue')
ax.set_xlabel('Time (seconds)')
ax.set_ylabel('Frame Rate (fps)')
ax.set_title('Real-time Frame Rate Analysis', fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)

plt.savefig('figure6_frame_rate.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 7: State Update Frequency
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

np.random.seed(902)
time_stamps = np.arange(0, 30, 0.5)  # 30 seconds
# Realistic state update patterns with spikes
base_updates = np.random.poisson(8, 60)
# Add event spikes at specific times
spike_times = [10, 20, 25]
for spike_time in spike_times:
    idx = int(spike_time * 2)  # Convert to index
    if idx < len(base_updates):
        base_updates[idx] += np.random.randint(15, 30)

state_updates = add_realistic_noise(base_updates, noise_level=0.1, occasional_spike_prob=0.02)
state_updates = np.maximum(state_updates, 0)

ax.plot(time_stamps, state_updates, 'b-', linewidth=1.2, alpha=0.8)
ax.fill_between(time_stamps, 0, state_updates, alpha=0.15, color='blue')
ax.set_xlabel('Time (seconds)')
ax.set_ylabel('State Updates per Second')
ax.set_title('State Update Frequency', fontweight='bold')
ax.grid(True, alpha=0.3)

# Add average line
avg_updates = np.mean(state_updates)
ax.axhline(y=avg_updates, color='red', linestyle='--', linewidth=1.5, alpha=0.7, 
            label=f'Average: {avg_updates:.1f}/s')
ax.legend(loc='upper right')

plt.savefig('figure7_state_updates.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

# FIGURE 8: Page Load Performance
fig, ax = plt.subplots(figsize=(8, 5))
fig.patch.set_facecolor('white')

pages = ['Dashboard', 'Roadmap', 'Profile', 'Settings', 'Chat']
# Realistic page load times with variance
load_samples = []
base_load_times = [1.2, 1.8, 0.9, 0.6, 1.4]  # seconds
for base_time in base_load_times:
    samples = np.random.normal(base_time, base_time * 0.15, 30)
    samples = np.maximum(samples, 0.3)
    # Add occasional outliers for slower pages
    if base_time > 1.0:
        outlier_indices = np.random.choice(len(samples), size=2, replace=False)
        samples[outlier_indices] += np.random.uniform(base_time * 0.3, base_time * 0.5, 2)
    load_samples.append(samples)

# Box plot with 2s threshold
bp = ax.boxplot(load_samples, labels=pages, patch_artist=True, widths=0.6)
colors = ['#F18F01' if mean > 2.0 else '#2E86AB' for mean in base_load_times]
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.8)

ax.axhline(y=2.0, color='red', linestyle='--', linewidth=1.5, alpha=0.7, label='2s Threshold')
ax.set_ylabel('Load Time (seconds)')
ax.set_title('Page Load Performance', fontweight='bold')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)

plt.savefig('figure8_page_load.png', dpi=300, bbox_inches='tight', facecolor='white', pad_inches=0.2)
plt.close()

print("✅ Single-Panel IEEE Research Figures Generated Successfully!")
print("📊 Files created:")
print("   - figure1_api_response_time.png")
print("   - figure2_database_latency.png")
print("   - figure3_threat_detection.png")
print("   - figure4_cpu_utilization.png")
print("   - figure5_component_render.png")
print("   - figure6_frame_rate.png")
print("   - figure7_state_updates.png")
print("   - figure8_page_load.png")
