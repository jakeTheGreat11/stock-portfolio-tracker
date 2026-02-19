from django.urls import path
from . import views

urlpatterns = [
    path("holdings/", views.get_holdings_list, name="get-holdings-list"),
]
