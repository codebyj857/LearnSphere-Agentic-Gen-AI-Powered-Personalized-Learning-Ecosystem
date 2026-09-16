"""Bidirectional LSTM baseline for Deep Knowledge Tracing.

A lighter-weight recurrent baseline used to benchmark the Transformer-DKT. A
bidirectional LSTM (:class:`torch.nn.LSTM` with ``bidirectional=True``) reads
the interaction sequence, and the concatenated forward/backward hidden states
are projected to per-skill response logits.
"""

from __future__ import annotations

import torch
from torch import nn
from torch.utils.data import DataLoader


class BiLSTMBaseline(nn.Module):
    """Bidirectional-LSTM DKT baseline model.

    Parameters
    ----------
    num_skills:
        Number of distinct knowledge concepts / skills in the dataset.
    embed_dim:
        Maximum embedding index for skill inputs.
    hidden_dim:
        Dimensionality of each LSTM hidden state.
    num_layers:
        Number of stacked LSTM layers (per direction).
    dropout:
        Dropout probability applied between stacked LSTM layers.
    """

    def __init__(
        self,
        num_skills: int,
        embed_dim: int = 64,
        hidden_dim: int = 64,
        num_layers: int = 1,
        dropout: float = 0.1,
    ) -> None:
        super().__init__()
        self.num_skills = num_skills
        self.hidden_dim = hidden_dim

        self.skill_embedding = nn.Embedding(num_skills, embed_dim)
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        # Bidirectional concat doubles the feed-forward input width.
        self.head = nn.Linear(hidden_dim * 2, 1)

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
        outputs, _ = self.lstm(embedded)
        logits = self.head(outputs).squeeze(-1)
        return logits

    def save(self, path: str) -> None:
        """Persist model state to disk.

        Parameters
        ----------
        path:
            Destination file path for the serialised checkpoint.
        """
        torch.save(self.state_dict(), path)


def train_model(
    model: BiLSTMBaseline,
    dataloader: DataLoader,
    epochs: int = 5,
    learning_rate: float = 1e-3,
) -> list[float]:
    """Train the BiLSTM baseline with Adam and categorical cross-entropy.

    Parameters
    ----------
    model:
        The :class:`BiLSTMBaseline` model to train.
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

    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss()

    epoch_losses: list[float] = []
    for _epoch in range(1, epochs + 1):
        running_loss = 0.0
        num_batches = 0
        for skill_ids, correct_flags in dataloader:
            optimizer.zero_grad()
            logits = model(skill_ids, correct_flags)

            flat_logits = logits.reshape(-1, 1)
            flat_logits = torch.cat([-flat_logits, flat_logits], dim=1)
            flat_targets = correct_flags.reshape(-1).long()

            loss = criterion(flat_logits, flat_targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            num_batches += 1

        epoch_losses.append(running_loss / max(1, num_batches))

    return epoch_losses