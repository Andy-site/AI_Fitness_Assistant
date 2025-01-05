from django.urls import path, include
from .views import HomePageData
from dj_rest_auth.registration.views import RegisterView

urlpatterns = [
    path('api/home/', HomePageData.as_view(), name='home-api'),  # API endpoint
    path('auth/registration/', RegisterView.as_view(), name='registration'),
    path('auth/', include('dj_rest_auth.urls')),  # Login, Logout, Password Change
]
