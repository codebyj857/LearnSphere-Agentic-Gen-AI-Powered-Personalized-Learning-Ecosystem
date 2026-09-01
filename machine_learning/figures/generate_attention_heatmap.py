import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

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
    'axes.grid': False
})

# Generate realistic self-attention weight matrix
np.random.seed(42)
n_heads = 8
seq_len = 12

# Create multi-head attention pattern with realistic structure
attention_matrix = np.zeros((seq_len, seq_len))

# Add attention patterns typical in transformers
# 1. Self-attention (diagonal dominance)
for i in range(seq_len):
    attention_matrix[i, i] = np.random.uniform(0.7, 0.9)
    
# 2. Local attention patterns (near-diagonal)
for i in range(seq_len):
    for j in range(max(0, i-2), min(seq_len, i+3)):
        if i != j:
            attention_matrix[i, j] = np.random.uniform(0.3, 0.6)
            
# 3. Global attention patterns (sparse long-range connections)
global_pairs = [(0, 8), (1, 10), (3, 9), (5, 11), (7, 2)]
for i, j in global_pairs:
    attention_matrix[i, j] = np.random.uniform(0.4, 0.7)
    attention_matrix[j, i] = np.random.uniform(0.4, 0.7)

# Add some noise and normalize
noise = np.random.normal(0, 0.05, (seq_len, seq_len))
attention_matrix += noise
attention_matrix = np.clip(attention_matrix, 0, 1)

# Normalize each row to sum to 1 (softmax-like)
attention_matrix = attention_matrix / attention_matrix.sum(axis=1, keepdims=True)

# Create the heatmap
fig, ax = plt.subplots(figsize=(10, 8))

# Use deep blue to teal color scheme
cmap = sns.color_palette("Blues", as_cmap=True)
cmap = sns.blend_palette(["#001f3f", "#0074d9", "#7fdbff", "#ffffff"], as_cmap=True, n_colors=256)

# Create heatmap
im = ax.imshow(attention_matrix, cmap=cmap, aspect='auto', interpolation='nearest')

# Add colorbar
cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
cbar.set_label('Attention Weight', fontweight='bold', fontsize=12)

# Set labels and title
ax.set_title('Self-Attention Weight Matrix\n(Transformer Neural Network)', 
             fontsize=16, fontweight='bold', pad=20)
ax.set_xlabel('Key Position', fontweight='bold', fontsize=12)
ax.set_ylabel('Query Position', fontweight='bold', fontsize=12)

# Add tick labels
ax.set_xticks(np.arange(seq_len))
ax.set_yticks(np.arange(seq_len))
ax.set_xticklabels([f'Pos {i}' for i in range(seq_len)], rotation=45)
ax.set_yticklabels([f'Pos {i}' for i in range(seq_len)])

# Add grid lines for clarity
for i in range(seq_len + 1):
    ax.axhline(i - 0.5, color='gray', linewidth=0.5, alpha=0.3)
    ax.axvline(i - 0.5, color='gray', linewidth=0.5, alpha=0.3)

# Set white background
ax.set_facecolor('white')

plt.tight_layout()
plt.savefig('transformer_attention_heatmap.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()

print("✅ Transformer attention heatmap generated successfully!")
print("📊 File created: transformer_attention_heatmap.png")
