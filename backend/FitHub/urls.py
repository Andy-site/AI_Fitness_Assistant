from django.urls import path
from .views import HomePageData

urlpatterns = [
    path('api/home/', HomePageData.as_view(), name='home-api'),  # API endpoint
]
