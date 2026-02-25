from django.db import transaction
from .models import Stock, Holding
import requests
from django.conf import settings
from django.core.cache import cache


FINNHUB_QUOTE_TTL_SECONDS = 1000


def add_or_merge_holdings(user, symbol, name, quantity, buy_price):

    with transaction.atomic():

        stock, created = Stock.objects.get_or_create(
            ticker=symbol,
            defaults={"name": name or symbol}
        )

        holding = Holding.objects.select_for_update().filter(
            user=user,
            stock=stock
        ).first()

        # if the user doesnt have this holding we create it
        if holding is None:
            holding = Holding.objects.create(
                user=user,
                stock=stock,
                quantity=quantity,
                avg_buy_price=buy_price
            )
        # we update it if we have this holding
        else:
            old_qty = holding.quantity
            old_avg = holding.avg_buy_price

            new_qty = old_qty + quantity

            new_avg = ((old_qty * old_avg) + (quantity * buy_price)) / new_qty

            holding.quantity = new_qty
            holding.avg_buy_price = new_avg
            holding.save()
    return holding


def get_quote_finnhub(symbol: str):
    symbol = symbol.strip().upper()
    cache_key = f"finnhub:quote:{symbol}"

    cached = cache.get(cache_key)
    if cached is not None:
        print("FETCHING FROM CACHE:", symbol)
        return cached

    url = "https://finnhub.io/api/v1/quote"
    params = {
        "symbol": symbol,
        "token": settings.FINNHUB_API_KEY
    }

    try:
        print(f"Requesting quote for {symbol} from Finnhub...")
        quote_request = requests.get(url=url, params=params, timeout=10)
        print(f"Response status code: {quote_request.status_code}")

        # Rate limit / blocked
        if quote_request.status_code == 429:
            result = {"price": None,
                      "error": "Rate limited (429)", "source": "finnhub"}
            cache.set(cache_key, result, 15)
            return result

        quote_request.raise_for_status()
        data = quote_request.json()
    except requests.RequestException as e:
        print("FINNHUB REQUEST FAILED")
        result = {"price": None,
                  "error": "Finnhub request failed", "source": "finnhub"}
        cache.set(cache_key, result, 15)
        return result

    price = data.get("c")

    # If the symbol is not found or has no data, because finhub can not have the data sometimes
    if price in (None, 0):
        result = {"price": None, "error": "No price returned"}
        cache.set(cache_key, result, FINNHUB_QUOTE_TTL_SECONDS)
        return result

    result = {
        "price": float(price),
        "error": None,
        "source": "finnhub",
    }

    cache.set(cache_key, result, FINNHUB_QUOTE_TTL_SECONDS)
    return result
