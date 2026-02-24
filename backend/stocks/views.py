from rest_framework.response import Response
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Holding, Stock
from .serializers import HoldingSerializer, HoldingAddSerializer, HoldingUpdateSerializer
from rest_framework import status
from django.conf import settings
import requests
from .services import add_or_merge_holdings, get_quote_finnhub
from django.db import transaction
from decimal import Decimal


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_holdings_list(request):
    user = request.user
    user_holdings = Holding.objects.filter(user=user).select_related("stock")
    holdings_serialized = HoldingSerializer(user_holdings, many=True)
    return Response(holdings_serialized.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stock_search(request):
    query_param = request.query_params.get("q", "").strip()

    if not query_param:
        return Response(
            {"details": "Missing query param"},
            status=status.HTTP_400_BAD_REQUEST
        )

    profile_url = "https://financialmodelingprep.com/stable/search-name"
    params = {"query": query_param, "apikey": settings.FMP_API_KEY}

    try:
        response = requests.get(url=profile_url,
                                params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        return Response(
            {"detail": "FMP request failed", "error": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

    results = []
    for item in data:
        symbol = item.get("symbol")
        name = item.get("name")
        exchange = item.get("exchangeShortName") or item.get("exchange")

        results.append({
            "description": name,
            "displaySymbol": symbol,
            "symbol": symbol,
            "type": exchange or "UNKNOWN",
        })

    return Response({
        "count": len(results),
        "results": results
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stock_details(request, symbol: str):
    symbol = symbol.strip().upper()

    profile_url = "https://financialmodelingprep.com/stable/profile"
    params = {"symbol": symbol, "apikey": settings.FMP_API_KEY}

    try:
        profile_request = requests.get(
            url=profile_url, params=params, timeout=10)
        profile_request.raise_for_status()
        profile_data = profile_request.json()

    except requests.RequestException as e:
        return Response(
            {"detail": "FMP PROFILE request failed", "error": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

    if not profile_data:
        return Response(
            {"detail": f"Profile Symbol not found: {symbol}"},
            status=status.HTTP_404_NOT_FOUND,
        )
    profile = profile_data[0]

    quote_data = get_quote_finnhub(symbol)

    normalized = {
        "symbol": symbol,
        "name": profile.get("companyName") or profile.get("name"),
        "exchange": profile.get("exchangeShortName") or profile.get("exchange"),
        "country": profile.get("country"),
        "currency": profile.get("currency"),
        "description": profile.get("description"),
        "industry": profile.get("industry"),
        "logo": profile.get("image"),
        "website": profile.get("website"),
        "ipo": profile.get("ipoDate"),
        "marketCapitalization": profile.get("mktCap"),
        "shareOutstanding": profile.get("sharesOutstanding"),
        "quote": {
            "price": quote_data["price"],
        },
        "quote_error": quote_data["error"],
        "quote_source": quote_data["source"]
    }

    return Response(data=normalized, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_holding(request):
    add_serializer = HoldingAddSerializer(data=request.data)
    add_serializer.is_valid(raise_exception=True)

    data = add_serializer.validated_data

    symbol = data["symbol"].upper().strip()

    holding = add_or_merge_holdings(user=request.user, symbol=symbol, name=data.get(
        "name"), quantity=data.get("quantity"), buy_price=data.get("buy_price"))

    return Response(
        HoldingSerializer(holding).data,
        status=status.HTTP_200_OK
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_holding(request, symbol: str):
    symbol = symbol.upper().strip()

    stock = Stock.objects.filter(ticker=symbol).first()

    if stock is None:
        return Response(
            {"detail": f"Stock with symbol {symbol} not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    holding = Holding.objects.filter(user=request.user, stock=stock).first()
    if holding is None:
        return Response(
            {"detail": f"Holding with symbol {symbol} not found for user."},
            status=status.HTTP_404_NOT_FOUND
        )

    holding.delete()
    return Response(
        {"detail": f"Holding with symbol {symbol} has been deleted."},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_holding(request, symbol: str):
    symbol = symbol.upper().strip()

    update_serializer = HoldingUpdateSerializer(data=request.data)
    update_serializer.is_valid(raise_exception=True)
    data = update_serializer.validated_data

    stock = Stock.objects.filter(ticker=symbol).first()

    if stock is None:
        return Response(
            {"detail": f"Stock with symbol {symbol} not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    with transaction.atomic():
        holding = Holding.objects.filter(
            user=request.user, stock=stock).first()
        if holding is None:
            return Response(
                {"detail": f"Holding with symbol {symbol} not found for user."},
                status=status.HTTP_404_NOT_FOUND
            )
        if "quantity" in data:
            holding.quantity = data["quantity"]
        if "avg_buy_price" in data:
            holding.avg_buy_price = data["avg_buy_price"]

        holding.save()
    return Response(
        HoldingSerializer(holding).data,
        status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def holdings_summary(request):
    holdings = Holding.objects.filter(
        user=request.user).select_related("stock")

    total_cost_basis = Decimal("0")
    total_market_value = Decimal("0")
    total_unrealized_pl = Decimal("0")

    rows = []

    for holding in holdings:
        symbol = holding.stock.ticker
        name = holding.stock.name

        # current holding
        quantity = holding.quantity
        average_buy_price = holding.avg_buy_price
        cost_basis = quantity * average_buy_price

        quote = get_quote_finnhub(symbol)
        price = quote["price"]

        market_value = None
        unrealized_pl = None
        unrealized_pl_percent = None

        # we put this outside the price check because even if we can not calculate the market value and pl without a price, we still want to include the holding in the summary with the cost basis and quantity in case of an api issue
        total_cost_basis += cost_basis

        if price is not None:
            current_price = Decimal(str(price))
            market_value = quantity * current_price
            unrealized_pl = market_value - cost_basis

            # these are dependet on the api returning a price, if we dont have a price we can not calculate these
            total_market_value += market_value
            total_unrealized_pl += unrealized_pl

            if cost_basis > 0:
                unrealized_pl_percent = (
                    unrealized_pl / cost_basis) * Decimal("100")

        rows.append({
            "symbol": symbol,
            "name": name,
            "quantity": str(quantity),
            "avg_buy_price": str(average_buy_price),

            "quote": {
                "price": price,
                "source": quote["source"],
                "error": quote["error"],
            },

            "cost_basis": str(cost_basis),
            "market_value": str(market_value) if market_value is not None else None,
            "unrealized_pl": str(unrealized_pl) if unrealized_pl is not None else None,
            "unrealized_pl_percent": str(unrealized_pl_percent) if unrealized_pl_percent is not None else None,
        })

    total_unrealized_pl_percent = None
    if total_cost_basis > 0:
        total_unrealized_pl_percent = (
            total_unrealized_pl / total_cost_basis) * Decimal("100")

    return Response({
        "total_cost_basis": str(total_cost_basis),
        "total_market_value": str(total_market_value),
        "total_unrealized_pl": str(total_unrealized_pl),
        "total_unrealized_pl_percent": str(total_unrealized_pl_percent) if total_unrealized_pl_percent is not None else None,
        "holdings": rows,
    }, status=status.HTTP_200_OK)
