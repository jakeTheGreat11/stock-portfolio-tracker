from django.urls import path
from . import views

urlpatterns = [
    path("stocks/search/", views.stock_search, name="stock-search"),
    path("stocks/<str:symbol>/details/",
         views.stock_details, name="stock-details"),

    path("holdings/", views.get_holdings_list, name="get-holdings-list"),
    path("holdings/add/", views.add_holding, name="add-holdings"),
    path("holdings/delete/<str:symbol>/", views.delete_holding, name="holding-delete"),
    path("holdings/update/<str:symbol>/", views.update_holding, name="holding-update"),
    path("holdings/summary/", views.holdings_summary, name="holdings-summary"),
]
