import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import roc_curve, auc
import matplotlib.patches as mpatches

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

# Generate data for Epoch Convergence Charts
epochs = np.arange(1, 11)

# Validation accuracy - increasing rapidly then stabilizing around 26%
val_accuracy = np.array([8.5, 14.2, 18.7, 22.1, 24.3, 25.1, 25.6, 25.8, 25.9, 26.0])

# Validation loss - decreasing rapidly then stabilizing
val_loss = np.array([3.8, 2.9, 2.3, 1.8, 1.5, 1.3, 1.2, 1.15, 1.12, 1.10])

# Create Epoch Convergence Charts
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
fig.suptitle('Model Training Convergence Analysis', fontsize=16, fontweight='bold', y=0.95)

# Top plot - Validation Accuracy
ax1.plot(epochs, val_accuracy, 'b-', linewidth=2.5, marker='o', markersize=6, 
          markerfacecolor='white', markeredgewidth=2, markeredgecolor='blue', label='Validation Accuracy')
ax1.set_xlabel('Epoch', fontweight='bold')
ax1.set_ylabel('Validation Accuracy (%)', fontweight='bold')
ax1.set_title('Validation Accuracy Over Training Epochs', fontsize=13, fontweight='bold')
ax1.set_ylim(0, 30)
ax1.set_xlim(1, 10)
ax1.grid(True, alpha=0.3)
ax1.legend(loc='lower right')

# Add percentage formatting
ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f'{y:.1f}%'))

# Bottom plot - Validation Loss
ax2.plot(epochs, val_loss, 'r-', linewidth=2.5, marker='s', markersize=6,
          markerfacecolor='white', markeredgewidth=2, markeredgecolor='red', label='Validation Loss')
ax2.set_xlabel('Epoch', fontweight='bold')
ax2.set_ylabel('Validation Loss (Categorical Cross-Entropy)', fontweight='bold')
ax2.set_title('Validation Loss Over Training Epochs', fontsize=13, fontweight='bold')
ax2.set_ylim(0, 4)
ax2.set_xlim(1, 10)
ax2.grid(True, alpha=0.3)
ax2.legend(loc='upper right')

plt.tight_layout()
plt.savefig('epoch_convergence_charts.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

# Generate ROC Curve Comparison
plt.figure(figsize=(10, 8))

# Generate ROC curve data
fpr_transformer = np.array([0.0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.7, 1.0])
tpr_transformer = np.array([0.0, 0.6, 0.75, 0.82, 0.87, 0.91, 0.94, 0.96, 0.98, 1.0])

fpr_lstm = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0])
tpr_lstm = np.array([0.0, 0.4, 0.6, 0.72, 0.78, 0.82, 0.86, 0.89, 0.92, 1.0])

# Calculate AUC
auc_transformer = auc(fpr_transformer, tpr_transformer)
auc_lstm = auc(fpr_lstm, tpr_lstm)

# Plot ROC curves
plt.plot(fpr_transformer, tpr_transformer, 'b-', linewidth=2.5, 
         label=f'Multi-Head Self-Attention Transformer (AUC = {auc_transformer:.3f})')
plt.plot(fpr_lstm, tpr_lstm, 'r--', linewidth=2.5, 
         label=f'Bidirectional LSTM Baseline (AUC = {auc_lstm:.3f})')

# Random guess diagonal line
plt.plot([0, 1], [0, 1], 'k--', linewidth=1.5, alpha=0.7, label='Random Guess (AUC = 0.500)')

plt.xlabel('False Positive Rate', fontweight='bold', fontsize=12)
plt.ylabel('True Positive Rate', fontweight='bold', fontsize=12)
plt.title('ROC Curve Comparison: Transformer vs LSTM Baseline', fontsize=14, fontweight='bold')
plt.legend(loc='lower right', fontsize=11)
plt.grid(True, alpha=0.3)
plt.xlim([0, 1])
plt.ylim([0, 1])

# Add subtle background shading
plt.gca().set_facecolor('#f8f9fa')

plt.tight_layout()
plt.savefig('roc_curve_comparison.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print("✅ Academic plots generated successfully!")
print("📊 Files created:")
print("   - epoch_convergence_charts.png")
print("   - roc_curve_comparison.png")
