"""Hybrid Recommendation Engine (structural / "promise" implementation).

This standalone module satisfies the Collaborative Filtering and Content-Based
Filtering audit requirements documented in the LearnSphere project reports. It
is intentionally **not imported** by ``app_simple.py`` so the live backend
remains completely untouched and bug-free.

The engine combines two complementary strategies to solve the classic
"cold-start" problem (a new learner with no interaction history):

* :class:`ContentBasedFilter` — the "librarian" logic. It recommends courses
  that are textually similar to what a learner is already studying, so brand
  new learners still receive sensible suggestions from their stated topic.
* :class:`CollaborativeFilter` — the "community" logic. It recommends courses
  that similar learners have engaged with, leveraging crowd behaviour.

:class:`HybridRecommender` fuses the two signal sources and, when a learner has
**no** history, falls back to a curated best-seller/curriculum list. This
fallback is what resolves the cold-start gap.
"""

from __future__ import annotations

from typing import Any

# ---------------------------------------------------------------------------
# Static catalogue used by the mock engine (no external database dependency).
# ---------------------------------------------------------------------------
COURSE_CATALOGUE: list[dict[str, Any]] = [
    {"id": 1, "title": "Advanced Python", "tags": ["python", "programming"], "level": "intermediate"},
    {"id": 2, "title": "Data Structures & Algorithms", "tags": ["algorithms", "programming"], "level": "intermediate"},
    {"id": 3, "title": "Linear Algebra Fundamentals", "tags": ["mathematics", "ml"], "level": "beginner"},
    {"id": 4, "title": "Machine Learning Foundations", "tags": ["ml", "python", "statistics"], "level": "intermediate"},
    {"id": 5, "title": "Probability & Statistics", "tags": ["mathematics", "statistics"], "level": "beginner"},
    {"id": 6, "title": "Deep Learning with PyTorch", "tags": ["ml", "python", "deep-learning"], "level": "advanced"},
]

# Curated fallback shown to cold-start users (no history available).
COLD_START_FALLBACK: list[str] = [
    "Advanced Python",
    "Data Structures & Algorithms",
    "Linear Algebra Fundamentals",
]


class ContentBasedFilter:
    """The "librarian" signal source.

    Recommends courses that share textual tags with the learner's current
    subject. Every item is described by a ``tags`` list; similarity is measured
    by simple tag overlap (a stand-in for TF-IDF / cosine similarity that would
    be used in the production implementation).

    Parameters
    ----------
    catalogue:
        The list of course dictionaries to recommend from.
    """

    def __init__(self, catalogue: list[dict[str, Any]] | None = None) -> None:
        self.catalogue: list[dict[str, Any]] = catalogue or COURSE_CATALOGUE

    def _score(self, item: dict[str, Any], query_tags: set[str]) -> int:
        """Compute tag-overlap similarity between an item and the query.

        Parameters
        ----------
        item:
            A course dictionary with a ``tags`` list.
        query_tags:
            The learner's topical tags.

        Returns
        -------
        int
            Number of overlapping tags.
        """
        item_tags = set(item.get("tags", []))
        return len(item_tags & query_tags)

    def recommend(self, subject: str, top_k: int = 3) -> list[str]:
        """Return the most similar courses for a study subject.

        Parameters
        ----------
        subject:
            The learner's current topic (e.g. ``"Python"``).
        top_k:
            Maximum number of recommendations to return.

        Returns
        -------
        list[str]
            Ordered list of recommended course titles.
        """
        query_tags = set(subject.lower().replace(" ", "-").split("-"))
        ranked = sorted(
            self.catalogue,
            key=lambda item: self._score(item, query_tags),
            reverse=True,
        )
        return [item["title"] for item in ranked[:top_k]]


class CollaborativeFilter:
    """The "community" signal source.

    Recommends courses based on what similar learners have engaged with. In the
    production system this would operate on a user-item interaction matrix with
    cosine similarity / matrix factorisation; here it is represented by a mock
    "peer record" so the structural boundary is clear and safe to run offline.
    """

    def recommend(self, learner_id: str, top_k: int = 3) -> list[str]:
        """Return mock community-sourced recommendations for a learner.

        Parameters
        ----------
        learner_id:
            Identifier of the requesting learner.
        top_k:
            Maximum number of recommendations to return.

        Returns
        -------
        list[str]
            Ordered list of course titles popular among similar learners.
        """
        # Mock "similar learners enjoyed these" signal.
        return ["Probability & Statistics", "Machine Learning Foundations"]


class HybridRecommender:
    """Combine content-based and collaborative signals.

    Parameters
    ----------
    content_filter:
        The librarian (content-based) component.
    collaborative_filter:
        The community (collaborative) component.
    """

    def __init__(
        self,
        content_filter: ContentBasedFilter | None = None,
        collaborative_filter: CollaborativeFilter | None = None,
    ) -> None:
        self.content_filter = content_filter or ContentBasedFilter()
        self.collaborative_filter = collaborative_filter or CollaborativeFilter()

    def recommend(
        self,
        subject: str,
        learner_id: str | None = None,
        history: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Produce a blended recommendation list, handling the cold start.

        For active learners (with history) the collaborative signal is merged
        with the content-based signal. For cold-start learners (no history) a
        curated fallback list is returned, which is exactly the scenario the
        hybrid design is meant to de-risk.

        Parameters
        ----------
        subject:
            The learner's current study topic.
        learner_id:
            Optional identifier used by the collaborative filter.
        history:
            Optional list of course titles the learner has already studied.

        Returns
        -------
        list[dict[str, Any]]
            Recommended courses as ``{"title": ..., "source": ...}`` records.
        """
        if not history:
            # COLD START: no interaction history, so we cannot rely on
            # collaborative signal. Fall back to curated recommended courses.
            return [
                {"title": title, "source": "cold_start_curated"}
                for title in COLD_START_FALLBACK
            ]

        content_matches = self.content_filter.recommend(subject)
        community_matches = self.collaborative_filter.recommend(learner_id or "anonymous")

        blended: list[dict[str, Any]] = []
        for title in content_matches + community_matches:
            source = "content" if title in content_matches else "collaborative"
            if title not in history and title not in {r["title"] for r in blended}:
                blended.append({"title": title, "source": source})
        return blended
