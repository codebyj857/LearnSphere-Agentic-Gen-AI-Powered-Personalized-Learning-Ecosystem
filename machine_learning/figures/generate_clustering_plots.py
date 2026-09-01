import matplotlib.pyplot as plt
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.datasets import make_blobs

# Set professional academic style
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams.update({
    'font.size': 12,
    'axes.labelsize': 12,
    'axes.titlesize': 14,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 11,
    'figure.titlesize': 16,
    'axes.grid': True,
    'grid.alpha': 0.3
})

# Generate synthetic student behavioral data
np.random.seed(42)
n_samples = 300
X, _ = make_blobs(n_samples=n_samples, centers=3, cluster_std=1.2, random_state=42)

# Add some outliers for DBSCAN to detect
outliers = np.random.uniform(low=-8, high=8, size=(20, 2))
X_with_outliers = np.vstack([X, outliers])

# Apply K-Means clustering
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans_labels = kmeans.fit_predict(X)

# Apply DBSCAN clustering
dbscan = DBSCAN(eps=1.5, min_samples=5)
dbscan_labels = dbscan.fit_predict(X_with_outliers)

# Create clustering comparison plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
fig.suptitle('Student Behavioral Data Clustering Analysis', fontsize=16, fontweight='bold')

# K-Means Clustering (Left)
colors_kmeans = ['#3b82f6', '#10b981', '#f59e0b']  # blue, yellow, green
for i in range(3):
    mask = kmeans_labels == i
    ax1.scatter(X[mask, 0], X[mask, 1], c=colors_kmeans[i], alpha=0.7, s=50, 
               label=f'Cluster {i+1}', edgecolors='white', linewidth=0.5)

ax1.set_title('K-Means Clustering', fontsize=14, fontweight='bold')
ax1.set_xlabel('Behavioral Feature 1', fontweight='bold')
ax1.set_ylabel('Behavioral Feature 2', fontweight='bold')
ax1.legend(loc='upper right')
ax1.grid(True, alpha=0.3)
ax1.set_facecolor('white')

# DBSCAN Clustering (Right)
colors_dbscan = ['#3b82f6', '#10b981', '#f59e0b']  # blue, yellow, green
for i in range(3):
    if i in dbscan_labels:
        mask = dbscan_labels == i
        ax2.scatter(X_with_outliers[mask, 0], X_with_outliers[mask, 1], 
                   c=colors_dbscan[i], alpha=0.7, s=50, 
                   label=f'Cluster {i+1}', edgecolors='white', linewidth=0.5)

# Highlight outliers in DBSCAN (black dots)
outlier_mask = dbscan_labels == -1
if np.any(outlier_mask):
    ax2.scatter(X_with_outliers[outlier_mask, 0], X_with_outliers[outlier_mask, 1], 
               c='black', alpha=0.9, s=60, marker='o', 
               label='Outliers/Anomalies', edgecolors='red', linewidth=1.5)

ax2.set_title('DBSCAN Clustering with Anomaly Detection', fontsize=14, fontweight='bold')
ax2.set_xlabel('Behavioral Feature 1', fontweight='bold')
ax2.set_ylabel('Behavioral Feature 2', fontweight='bold')
ax2.legend(loc='upper right')
ax2.grid(True, alpha=0.3)
ax2.set_facecolor('white')

plt.tight_layout()
plt.savefig('clustering_comparison.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print("✅ Clustering visualization generated successfully!")
print("📊 File created: clustering_comparison.png")
