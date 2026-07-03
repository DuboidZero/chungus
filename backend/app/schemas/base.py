from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: Python uses snake_case, the API speaks camelCase.
    e.g. must_change_password (Python) <-> mustChangePassword (JSON)."""
    model_config = ConfigDict(
        alias_generator=to_camel,   # auto-generate camelCase aliases
        populate_by_name=True,      # accept either snake_case or camelCase on input
        from_attributes=True,       # build from DB objects directly
    )