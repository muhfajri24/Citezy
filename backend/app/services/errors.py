"""Public-safe provider errors. Never include vendor bodies, keys or prompts."""
class ResearchServiceError(Exception):
    def __init__(self, code: str, public_message: str):
        self.code = code
        self.public_message = public_message
        super().__init__(public_message)


def has_credential(value: str) -> bool:
    return bool(value.strip()) and not value.strip().lower().startswith(("your_", "replace", "changeme"))
