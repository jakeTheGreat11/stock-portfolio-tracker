from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from .models import Stock, Holding, User
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, F, DecimalField, ExpressionWrapper, Count


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_stock_totals(request, symbol: str):
    sanatizedSymbol = symbol.strip().upper()

    stock = Stock.objects.filter(ticker=sanatizedSymbol).first()

    if stock is None:
        return Response({"detail": f"No stock with this symbol was found {sanatizedSymbol}"}, status=status.HTTP_404_NOT_FOUND)

    query_result = Holding.objects.filter(stock=stock).aggregate(
        total_quantity=Sum("quantity"),
        total_cost_basis=Sum(F("quantity") * F("avg_buy_price")),
        number_of_holders=Count("user", distinct=True)
    )

    return Response({
        "symbol": symbol,
        "total_quantity": query_result["total_quantity"],
        "total_cost_basis": query_result["total_cost_basis"],
        "number_of_holders": query_result["number_of_holders"]
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_overview(request):
    query_result = Holding.objects.aggregate(
        total_quantity=Sum("quantity"),
        total_cost_basis=Sum(F("quantity") * F("avg_buy_price")),
        total_positions=Count("id"),
        active_investors=Count("user", distinct=True),
        actively_owned_stocks=Count("stock", distinct=True)
    )
    total_registered_users = User.objects.count()

    return Response({
        "total_quantity": query_result["total_quantity"],
        "total_cost_basis": query_result["total_cost_basis"],
        "total_positions": query_result["total_positions"],
        "active_investors": query_result["active_investors"],
        "actively_owned_stocks": query_result["actively_owned_stocks"],
        "total_registered_users": total_registered_users
    })
