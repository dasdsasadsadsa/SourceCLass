class SourceClassEngineError(Exception):
    """Base error for Python engine failures."""


class ProviderError(SourceClassEngineError):
    """Raised when an AI provider cannot complete a request."""
