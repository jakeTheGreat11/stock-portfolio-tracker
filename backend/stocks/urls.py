from django.urls import path
from . import views

urlpatterns = [
    path("holdings/", views.get_holdings_list, name="get-holdings-list"),
    path("stocks/search/", views.stock_search, name="stock-search"),
    path("stocks/<str:symbol>/details/",
         views.stock_details, name="stock-details"),
    path("holdings/add/", views.add_holding, name="add-holdings")
]
