"""Data pipeline for Deep Knowledge Tracing (DKT).

Handles ingestion, normalisation and sequence padding for the OULAD and EdNet
learning-analytics datasets ahead of training the Transformer-DKT and
BiLSTM-baseline models in :mod:`machine_learning.models`.
"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import Any

import numpy as np

Number = int | float


class DataPipeline:
    """Standardised preprocessing pipeline for raw interaction logs.

    The pipeline expects per-student interaction sequences and applies feature
    normalisation followed by fixed-length sequence padding. The result is a
    dense numeric array suitable for ingestion by a PyTorch ``Dataset``.

    Parameters
    ----------
    max_seq_len:
        Maximum number of interactions retained per learner sequence. Longer
        sequences are truncated, shorter sequences are left-padded.
    scalers:
        Optional mapping from feature name to a plain callable normaliser
        (for example :class:`sklearn.preprocessing.StandardScaler`).
    """

    def __init__(
        self,
        max_seq_len: int = 64,
        scalers: dict[str, Callable[[Any], Any]] | None = None,
    ) -> None:
        self.max_seq_len = max_seq_len
        self.scalers = scalers or {}

    def load_oulad(self, csv_path: str) -> list[dict[str, Any]]:
        """Load and parse the OULAD learner-interaction CSV.

        Parameters
        ----------
        csv_path:
            Absolute path to the OULAD ``studentVle.csv`` (or similar) file.

        Returns
        -------
        list[dict[str, Any]]
            A list of raw interaction records, one dictionary per row.
        """
        raise NotImplementedError("OULAD CSV ingestion is not yet implemented.")

    def load_ednet(self, source_path: str) -> list[dict[str, Any]]:
        """Load and parse a raw EdNet interaction dump.

        Parameters
        ----------
        source_path:
            Path to the EdNet source directory or compressed archive.

        Returns
        -------
        list[dict[str, Any]]
            A list of raw EdNet interaction records.
        """
        raise NotImplementedError("EdNet ingestion is not yet implemented.")

    def normalise(
        self, records: list[dict[str, Any]]
    ) -> list[np.ndarray]:
        """Apply feature-wise normalisation to interaction records.

        Parameters
        ----------
        records:
            Raw interaction records returned by the loaders.

        Returns
        -------
        list[np.ndarray]
            One normalised feature matrix per learner sequence.
        """
        raise NotImplementedError("Feature normalisation is not yet implemented.")

    def pad_sequences(
        self, sequences: Sequence[Sequence[Number]]
    ) -> np.ndarray:
        """Left-pad and truncate interaction sequences to a fixed length.

        Parameters
        ----------
        sequences:
            Variable-length learner interaction sequences to pad.

        Returns
        -------
        np.ndarray
            Numeric array of shape ``(n_sequences, max_seq_len)``.
        """
        if not self.max_seq_len:
            return np.asarray(sequences, dtype=np.float32)

        padded = np.zeros(
            (len(sequences), self.max_seq_len), dtype=np.float32
        )
        for index, sequence in enumerate(sequences):
            clipped = np.asarray(sequence, dtype=np.float32)[-self.max_seq_len :]
            padded[index, -len(clipped) :] = clipped
        return padded

    def fit_transform(self, records: list[dict[str, Any]]) -> np.ndarray:
        """End-to-end run of normalisation followed by sequence padding.

        Parameters
        ----------
        records:
            Raw interaction records to transform.

        Returns
        -------
        np.ndarray
            Padded, normalised feature tensor ready for modelling.
        """
        normalised = self.normalise(records)
        return self.pad_sequences(normalised)


def build_default_pipeline(max_seq_len: int = 64) -> DataPipeline:
    """Construct a :class:`DataPipeline` configured with sensible defaults.

    Parameters
    ----------
    max_seq_len:
        Maximum interaction-sequence length. Defaults to ``64``.

    Returns
    -------
    DataPipeline
        A ready-to-use preprocessing pipeline.
    """
    return DataPipeline(max_seq_len=max_seq_len)