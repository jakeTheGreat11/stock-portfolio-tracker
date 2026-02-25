from django.urls import path
from . import admin_views

urlpatterns = [
    path("overview/", admin_views.admin_overview, name="admin-overview"),
    path("stocks/<str:symbol>/totals/",
         admin_views.admin_stock_totals, name="admin-stock-totals"),
]
