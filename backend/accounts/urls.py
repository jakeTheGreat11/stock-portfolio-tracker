from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import RegisterView, is_admin

urlpatterns = [
    path('login/', jwt_views.TokenObtainPairView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name="register"),
    path('refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path("is-admin/", is_admin, name="is-admin"),
]
