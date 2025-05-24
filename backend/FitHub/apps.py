from django.apps import AppConfig


class FitHubConfig(AppConfig):  # Not FitHubConfig (note lowercase h)
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'FitHub'

    def ready(self):
        import FitHub.signals

