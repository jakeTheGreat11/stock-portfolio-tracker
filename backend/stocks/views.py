from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Holding
from .serializers import HoldingSerializer, HoldingAddSerializer
from rest_framework import status
from django.conf import settings
import requests
from .services import add_or_merge_holdings


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
    quote_url = "https://financialmodelingprep.com/stable/quote-short"
    params = {"symbol": symbol, "apikey": settings.FMP_API_KEY}

    try:
        profile_request = requests.get(
            url=profile_url, params=params, timeout=10)
        profile_request.raise_for_status()
        profile_data = profile_request.json()

        quote_request = requests.get(url=quote_url, params=params, timeout=10)
        quote_request.raise_for_status()
        quote_data = quote_request.json()

    except requests.RequestException as e:
        return Response(
            {"detail": "FMP request failed", "error": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

    if not profile_data:
        return Response(
            {"detail": f"Profile Symbol not found: {symbol}"},
            status=status.HTTP_404_NOT_FOUND,
        )
    if not quote_data:
        return Response(
            {"detail": f"Quote Symbol not found: {symbol}"},
            status=status.HTTP_404_NOT_FOUND
        )

    profile = profile_data[0]
    quote = quote_data[0]
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
            "price": quote.get("price"),
            "volume": quote.get("volume"),
        }
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
