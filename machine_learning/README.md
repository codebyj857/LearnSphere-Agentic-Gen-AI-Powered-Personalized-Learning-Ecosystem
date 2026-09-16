# Machine Learning Module

Data Science & Machine Learning scope (Joya). This directory implements the
professional **Deep Knowledge Tracing (DKT)** pipeline that powers the
LearnSphere predictive engine. Python plotting scripts no longer live here —
they have been extracted to `../research_plot_generators/`.

## Architecture

```
machine_learning/
├── __init__.py
├── inference.py                  # Flask-integration entry point (real-time predictions)
├── preprocessing/
│   ├── __init__.py
│   └── data_pipeline.py          # OULAD / EdNet ingestion, normalisation, sequence padding
├── clustering/
│   ├── __init__.py
│   └── behavioral_clustering.py  # K-Means++ and DBSCAN behavioural clustering
└── models/
    ├── __init__.py
    ├── transformer_dkt.py        # Multi-Head Self-Attention Transformer (primary)
    └── bilstm_baseline.py        # Bidirectional LSTM (benchmark baseline)
```

## Responsibilities

- **Preprocessing (`preprocessing/data_pipeline.py`):** normalises OULAD / EdNet
  interaction logs and pads variable-length learner sequences for batched models.
- **Clustering (`clustering/behavioral_clustering.py`):** K-Means++ refinement
  plus DBSCAN to derive behavioural learner archetypes and detect anomalies.
- **Models (`models/transformer_dkt.py`, `models/bilstm_baseline.py`):**
  Transformer encoder (Multi-Head Self-Attention) and a BiLSTM baseline.
- **Inference (`inference.py`):** the entry point the Flask backend calls. PyTorch
  is resolved lazily so project imports never hard-fail when the ML stack is absent.

## Usage (from repo root)

```bash
# Build and load a predictor
python -c "from machine_learning.inference import get_predictor; p = get_predictor('transformer', num_skills=100); print(p.predict([[1,2,3]]))"
```

## Figure Generators

All reusable plotting scripts were isolated into
[`../research_plot_generators/`](../research_plot_generators/) to keep the
professional ML module free of ad hoc figure scripts. Generated image outputs
are stored in `/figures/machine_learning/`.

```bash
python research_plot_generators/generate_clustering_plots.py
python research_plot_generators/generate_attention_heatmap.py
```