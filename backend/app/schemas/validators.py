"""Shared validation helpers for request schemas."""
from pydantic import field_validator


def non_empty_str(*field_names: str):
    """Reject strings that are empty or only whitespace, and trim surrounding spaces.
    Use for REQUIRED string fields."""
    @field_validator(*field_names, mode="before")
    @classmethod
    def _check(cls, v):
        if v is None:
            raise ValueError("This field is required and cannot be empty")
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("This field cannot be empty or just whitespace")
        return v
    return _check


def optional_str_trim(*field_names: str):
    """Trim optional string fields; turn empty/whitespace into None.
    Use for OPTIONAL string fields."""
    @field_validator(*field_names, mode="before")
    @classmethod
    def _trim(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return None
        return v
    return _trim