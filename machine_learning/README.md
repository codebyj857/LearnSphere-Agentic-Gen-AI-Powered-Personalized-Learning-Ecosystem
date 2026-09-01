# Machine Learning Module

Data Science & Machine Learning scope. This directory centralizes the
predictive analytics and research artifacts of the LearnSphere platform.

## Structure

```
machine_learning/
├── preprocessing/     # Data cleaning / feature engineering (OULAD, EdNet)
├── clustering/        # K-Means++ / DBSCAN behavioral anomaly detection
├── transformer/       # Multi-Head Self-Attention performance predictor
├── models/            # Trained weights / model definitions
├── data/              # Datasets & processed data
└── figures/           # Generated research/evaluation figures
```

## Role Responsibility

- **Deep Knowledge Tracing (DKT):** Predictive engine built on the OULAD
  and EdNet datasets to forecast real-time student performance.
- **Behavioral Anomaly Detection:** Two-stage unsupervised pipeline using
  K-Means++ followed by DBSCAN to isolate behavioral anomalies.
- **Transformer Predictor:** Multi-Head Self-Attention Transformer for
  student performance predictions.

## Figures

Reusable research figure generators are located in `figures/`:

- `generate_clustering_plots.py` - K-Means vs DBSCAN comparison
- `generate_attention_heatmap.py` - Self-attention weight matrix
- `generate_plots.py`, `generate_realistic_plots.py` - ROC / evaluation curves
- `generate_ieee_research_figures.py`, and related - IEEE-style research figures

Generate any figure from the `figures/` directory:

```bash
python generate_clustering_plots.py
python generate_attention_heatmap.py
```
