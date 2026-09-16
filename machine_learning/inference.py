"""Inference entry-point for the deployed Deep Knowledge Tracing pipeline.

This module is the single integration surface the Flask backend calls for
real-time learner-knowledge predictions. It loads the trained Transformer-DKT
(or BiLSTM-baseline) checkpoint and maps raw interaction sequences to response
probabilities.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np


def _pytorch_available() -> bool:
    """Report whether PyTorch is importable in the current environment.

    Returns
    -------
    bool
        ``True`` when ``torch`` is installed and importable.
    """
    try:
        import torch  # noqa: F401

        return True
    except ModuleNotFoundError:
        return False


class DKTInference:
    """Prediction wrapper around a trained DKT checkpoint.

    Parameters
    ----------
    model_arch:
        One of ``"transformer"`` or ``"bilstm"`` selecting the architecture.
    checkpoint_path:
        Path to the serialised ``.pt`` model weights.
    num_skills:
        Number of distinct knowledge concepts the model was trained on.
    device:
        Hardware device target; defaults to CPU when not provided.
    """

    def __init__(
        self,
        model_arch: str = "transformer",
        checkpoint_path: str | Path | None = None,
        num_skills: int = 0,
        device: str | None = None,
    ) -> None:
        self.model_arch = model_arch
        self.checkpoint_path = checkpoint_path
        self.num_skills = num_skills
        self.device = device or "cpu"
        self._torch = None if not _pytorch_available() else __import__("torch")
        self._model: Any = None

    def load(self) -> "DKTInference":
        """Build the requested model and load checkpoint weights.

        Returns
        -------
        DKTInference
            ``self`` with the model instantiated for reuse.
        """
        if self._torch is None:
            raise RuntimeError(
                "PyTorch is not installed in this environment. "
                "Install the ML stack before serving DKT predictions."
            )
        from machine_learning.models.bilstm_baseline import BiLSTMBaseline
        from machine_learning.models.transformer_dkt import TransformerDKT

        if self.model_arch == "bilstm":
            self._model = BiLSTMBaseline(num_skills=self.num_skills)
        else:
            self._model = TransformerDKT(num_skills=self.num_skills)

        if self.checkpoint_path is not None and Path(self.checkpoint_path).exists():
            state = self._torch.load(
                self.checkpoint_path, map_location=self.device
            )
            self._model.load_state_dict(state)
        self._model.eval()
        return self

    def predict(self, skill_sequences: list[list[int]]) -> list[float]:
        """Score raw learner interaction sequences.

        Parameters
        ----------
        skill_sequences:
            Variable-length lists of skill ids per learner, newest-last.

        Returns
        -------
        list[float]
            Average response probability per learner sequence.
        """
        if self._model is None:
            raise RuntimeError("Predict called before Model.load().")
        if self._torch is None:
            raise RuntimeError("PyTorch is not installed in this environment.")

        scores: list[float] = []
        for sequence in skill_sequences:
            skill_ids = self._torch.as_tensor(
                [sequence], dtype=self._torch.long, device=self.device
            )
            correct_flags = self._torch.zeros_like(skill_ids)
            with self._torch.no_grad():
                logits = self._model(skill_ids, correct_flags)
            probabilities = self._torch.sigmoid(logits)
            scores.append(probabilities.float().mean().item())
        return scores


def get_predictor(
    model_arch: str = "transformer",
    checkpoint_path: str | Path | None = None,
    num_skills: int = 0,
) -> DKTInference:
    """Build and load a ready-to-run predictor.

    Parameters
    ----------
    model_arch:
        Model architecture, ``"transformer"`` or ``"bilstm"``.
    checkpoint_path:
        Optional path to trained model weights.
    num_skills:
        Number of skills the model expects.

    Returns
    -------
    DKTInference
        A loaded inference object with ``predict`` available.
    """
    return DKTInference(
        model_arch=model_arch,
        checkpoint_path=checkpoint_path,
        num_skills=num_skills,
    ).load()