"""Transformer-based Deep Knowledge Tracing (DKTransformer).

Implements a Multi-Head Self-Attention model built on
:class:`torch.nn.TransformerEncoder` for the learner-knowledge-state predictor.

The encoder stacks self-attention, residual connections and position-wise
feed-forward blocks over padded (skill, response) interaction sequences.
:func:`train_model` provides a functional training loop that explicitly
initialises the Adam optimizer (:class:`torch.optim.Adam`) and a categorical
cross-entropy loss (:class:`torch.nn.CrossEntropyLoss`).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import torch
from torch import nn
from torch.utils.data import DataLoader


class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding injected into skill embeddings.

    Parameters
    ----------
    d_model:
        Model/embedding dimensionality.
    max_len:
        Maximum number of positions encoded.
    """

    def __init__(self, d_model: int, max_len: int = 512) -> None:
        super().__init__()
        self.register_buffer(
            "pe", self._build_position_matrix(d_model, max_len), persistent=False
        )

    @staticmethod
    def _build_position_matrix(d_model: int, max_len: int) -> torch.Tensor:
        """Precompute the sinusoidal position matrix.

        Parameters
        ----------
        d_model:
            Embedding width of the position encodings.
        max_len:
            Number of positions to encode.

        Returns
        -------
        torch.Tensor
            Position matrix of shape ``(max_len, d_model)``.
        """
        position = torch.arange(max_len, dtype=torch.float32).unsqueeze(1)
        divisor = torch.exp(
            torch.arange(0, d_model, 2, dtype=torch.float32)
            * (-torch.log(torch.tensor(10000.0)) / d_model)
        )
        pe = torch.zeros(max_len, d_model)
        pe[:, 0::2] = torch.sin(position * divisor)
        pe[:, 1::2] = torch.cos(position * divisor)
        return pe

    def forward(self, sequence: torch.Tensor) -> torch.Tensor:
        """Add positional encodings to the input embeddings.

        Parameters
        ----------
        sequence:
            Token embeddings of shape ``(batch_size, seq_len, d_model)``.

        Returns
        -------
        torch.Tensor
            Embeddings plus positional signal of the same shape.
        """
        return sequence + self.pe[: sequence.size(1)]


class TransformerDKT(nn.Module):
    """Full Transformer-DKT model for response prediction.

    Parameters
    ----------
    num_skills:
        Number of distinct knowledge concepts / skills in the dataset.
    d_model:
        Embedding width of skill and positional representations.
    nhead:
        Number of self-attention heads in the transformer encoder.
    num_layers:
        Number of stacked encoder blocks.
    dropout:
        Dropout probability applied inside the encoder blocks.
    """

    def __init__(
        self,
        num_skills: int,
        d_model: int = 64,
        nhead: int = 4,
        num_layers: int = 2,
        dropout: float = 0.1,
    ) -> None:
        super().__init__()
        self.num_skills = num_skills
        self.d_model = d_model

        self.skill_embedding = nn.Embedding(num_skills, d_model)
        self.pos_encoding = PositionalEncoding(d_model)
        self.encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dropout=dropout,
            batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(self.encoder_layer, num_layers)
        self.head = nn.Linear(d_model, 1)

    def forward(
        self,
        skill_ids: torch.Tensor,
        correct_flags: torch.Tensor,
    ) -> torch.Tensor:
        """Predict the probability of a correct response per position.

        Parameters
        ----------
        skill_ids:
            Skill indices of shape ``(batch_size, seq_len)``.
        correct_flags:
            Binary correctness of shape ``(batch_size, seq_len)``.

        Returns
        -------
        torch.Tensor
            Raw per-position logits of shape ``(batch_size, seq_len)``.
        """
        embedded = self.skill_embedding(skill_ids)
        embedded = embedded + correct_flags.unsqueeze(-1)
        encoded = self.encoder(self.pos_encoding(embedded))
        logits = self.head(encoded).squeeze(-1)
        return logits

    def save(self, path: str | Path, **kwargs: Any) -> None:
        """Persist model state to disk.

        Parameters
        ----------
        path:
            Destination file path for the serialised checkpoint.
        kwargs:
            Additional arguments forwarded to :meth:`torch.save`.
        """
        torch.save(self.state_dict(), path, **kwargs)


def train_model(
    model: TransformerDKT,
    dataloader: DataLoader,
    epochs: int = 5,
    learning_rate: float = 1e-3,
) -> list[float]:
    """Train the DKTransformer with Adam and categorical cross-entropy.

    Parameters
    ----------
    model:
        The :class:`TransformerDKT` model to train.
    dataloader:
        A ``DataLoader`` yielding ``(skill_ids, correct_flags)`` batches.
    epochs:
        Number of full passes over the dataloader.
    learning_rate:
        Learning rate for the Adam optimizer.

    Returns
    -------
    list[float]
        Loss value recorded at the end of each epoch.
    """
    model.train()

    # Explicit optimizer initialisation.
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    # Explicit classification loss: categorical cross-entropy.
    criterion = nn.CrossEntropyLoss()

    epoch_losses: list[float] = []
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        num_batches = 0
        for skill_ids, correct_flags in dataloader:
            optimizer.zero_grad()
            logits = model(skill_ids, correct_flags)

            # CrossEntropyLoss expects logits of shape (N, C). Flatten the
            # sequence dimension and treat "correct vs incorrect" as the 2-class
            # categorical target.
            flat_logits = logits.reshape(-1, 1)
            flat_logits = torch.cat([-flat_logits, flat_logits], dim=1)
            flat_targets = correct_flags.reshape(-1).long()

            loss = criterion(flat_logits, flat_targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            num_batches += 1

        average_loss = running_loss / max(1, num_batches)
        epoch_losses.append(average_loss)

    return epoch_losses