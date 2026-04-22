from __future__ import annotations

from typing import Set


def get_hidden_user_ids_for(user) -> Set[int]:
    """Users hidden from this user due to a block in either direction."""
    if not user or user.is_anonymous:
        return set()

    blocked_ids = set(user.blocked_users.values_list("id", flat=True))
    blocked_by_ids = set(user.blocked_by.values_list("id", flat=True))
    return blocked_ids | blocked_by_ids


def is_blocked_between(user_a, user_b) -> bool:
    """True when there is any block relationship between the two users."""
    if not user_a or not user_b:
        return False
    if user_a.is_anonymous or user_b.is_anonymous:
        return False

    return (
        user_a.blocked_users.filter(pk=user_b.pk).exists()
        or user_b.blocked_users.filter(pk=user_a.pk).exists()
    )
