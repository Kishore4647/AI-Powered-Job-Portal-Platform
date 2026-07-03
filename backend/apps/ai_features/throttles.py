from rest_framework.throttling import UserRateThrottle


class AIFeatureRateThrottle(UserRateThrottle):
    """Stricter, separate rate limit scope for expensive Gemini AI calls."""
    scope = "ai_feature"
