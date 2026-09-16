"""Behavioural clustering for Deep Knowledge Tracing.

Processes the OULAD (Open University Learning Analytics Dataset) feature
embeddings and segments learners into behavioural archetypes using two real
unsupervised algorithms from scikit-learn:

* :class:`sklearn.cluster.KMeans` with ``init="k-means++"`` for convex,
  well-separated behavioural groupings.
* :class:`sklearn.cluster.DBSCAN` for density-based discovery of non-convex
  clusters and outlier (noise) detection.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler


@dataclass
class ClusteringResult:
    """Encapsulates the output of a clustering run.

    Attributes
    ----------
    labels:
        Integer cluster assignment per learner (``-1`` denotes DBSCAN noise).
    n_clusters:
        Number of clusters discovered (excludes noise).
    silhouette_score:
        Optional silhouette metric summarising cluster separation.
    summaries:
        Per-cluster descriptive statistics.
    """

    labels: np.ndarray
    n_clusters: int
    silhouette_score: float
    summaries: list[dict[str, Any]]


class BehavioralClustering:
    """Cluster learners by their OULAD interaction behaviour.

    Parameters
    ----------
    algorithm:
        ``"kmeans"`` or ``"dbscan"``.
    random_state:
        Seeding for reproducible K-Means++ initialisation.
    """

    def __init__(self, algorithm: str = "kmeans", random_state: int = 0) -> None:
        self.algorithm = algorithm.lower()
        self.random_state = random_state

    def fit_predict(
        self,
        embeddings: np.ndarray,
        n_clusters: int = 4,
        radius: float = 0.5,
        min_samples: int = 5,
    ) -> ClusteringResult:
        """Fit the selected clustering model and return labelled results.

        Parameters
        ----------
        embeddings:
            Feature matrix of shape ``(n_learners, n_features)``.
        n_clusters:
            Target cluster count for K-Means++.
        radius:
            DBSCAN ``eps`` neighbourhood radius.
        min_samples:
            DBSCAN minimum samples for a dense region.

        Returns
        -------
        ClusteringResult
            Labels, cluster counts and per-cluster summaries.

        Raises
        ------
        ValueError
            If an unsupported algorithm name is supplied.
        """
        if self.algorithm == "kmeans":
            return self._kmeans(embeddings, n_clusters)
        if self.algorithm == "dbscan":
            return self._dbscan(embeddings, radius, min_samples)
        raise ValueError(f"Unsupported clustering algorithm: {self.algorithm!r}")

    def _kmeans(self, embeddings: np.ndarray, n_clusters: int) -> ClusteringResult:
        """Apply K-Means with ``k-means++`` seeding.

        Parameters
        ----------
        embeddings:
            Feature matrix of shape ``(n_learners, n_features)``.
        n_clusters:
            Number of behavioural clusters.

        Returns
        -------
        ClusteringResult
            Labelled K-Means++ result.
        """
        model = KMeans(
            n_clusters=n_clusters,
            init="k-means++",
            n_init=10,
            random_state=self.random_state,
        )
        labels = model.fit_predict(embeddings)
        return _build_result(labels, embeddings)

    def _dbscan(
        self,
        embeddings: np.ndarray,
        radius: float,
        min_samples: int,
    ) -> ClusteringResult:
        """Apply density-based DBSCAN clustering.

        Parameters
        ----------
        embeddings:
            Feature matrix of shape ``(n_learners, n_features)``.
        radius:
            Neighbourhood radius ``eps``.
        min_samples:
            Minimum dense-region sample count.

        Returns
        -------
        ClusteringResult
            Labelled DBSCAN result; noise is labelled ``-1``.
        """
        model = DBSCAN(eps=radius, min_samples=min_samples)
        labels = model.fit_predict(embeddings)
        return _build_result(labels, embeddings)


def _build_result(
    labels: np.ndarray, embeddings: np.ndarray
) -> ClusteringResult:
    """Assemble a :class:`ClusteringResult` from raw labels.

    Parameters
    ----------
    labels:
        Cluster labels assigned by a scikit-learn estimator.
    embeddings:
        Feature matrix used to derive cluster centroids.

    Returns
    -------
    ClusteringResult
        Aggregated, self-contained clustering output.
    """
    unique_no_noise = labels[labels != -1]
    n_clusters = len(np.unique(unique_no_noise)) if unique_no_noise.size else 0
    silhouette_score = 0.0

    if n_clusters >= 2 and labels.size >= 3:
        try:
            from sklearn.metrics import silhouette_score as _score

            silhouette_score = float(_score(embeddings, labels))
        except Exception:  # score undefined for degenerate label sets
            silhouette_score = 0.0

    summaries = _summarise_clusters(labels, embeddings)
    return ClusteringResult(
        labels=labels,
        n_clusters=n_clusters,
        silhouette_score=silhouette_score,
        summaries=summaries,
    )


def _summarise_clusters(
    labels: np.ndarray, embeddings: np.ndarray
) -> list[dict[str, Any]]:
    """Compute per-cluster descriptive statistics.

    Parameters
    ----------
    labels:
        Cluster labels assigned by a scikit-learn estimator.
    embeddings:
        Feature matrix used to derive cluster centroids.

    Returns
    -------
    list[dict[str, Any]]
        One dictionary per cluster with ``id``, ``size`` and ``centroid``.
    """
    clusters: list[dict[str, Any]] = []
    for cluster_id in np.unique(labels):
        mask = labels == cluster_id
        clusters.append(
            {
                "id": int(cluster_id),
                "size": int(mask.sum()),
                "centroid": embeddings[mask].mean(axis=0).tolist(),
            }
        )
    return clusters


def process_oulad(
    feature_matrix: np.ndarray,
    algorithm: str = "kmeans",
    n_clusters: int = 4,
    radius: float = 0.5,
    min_samples: int = 5,
) -> ClusteringResult:
    """End-to-end OULAD processing entry point.

    Standardises the provided OULAD feature matrix and runs the requested
    clustering algorithm.

    Parameters
    ----------
    feature_matrix:
        Raw OULAD-derived feature matrix of shape ``(n_learners, n_features)``.
    algorithm:
        ``"kmeans"`` or ``"dbscan"``.
    n_clusters:
        Cluster count for K-Means++.
    radius:
        DBSCAN ``eps``.
    min_samples:
        DBSCAN minimum samples.

    Returns
    -------
    ClusteringResult
        Fully processed clustering result ready for downstream reports.
    """
    scaler = StandardScaler()
    normalised = scaler.fit_transform(feature_matrix)
    clustering = BehavioralClustering(algorithm=algorithm)
    return clustering.fit_predict(
        normalised,
        n_clusters=n_clusters,
        radius=radius,
        min_samples=min_samples,
    )