from rest_framework import serializers
from .models import Stock, Holding


class StockSetializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["id", "sticker", "name"]


class HoldingSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(source="stock.ticker", read_only=True)
    name = serializers.CharField(source="stock.name", read_only=True)

    class Meta:
        model = Holding
        fields = ["id", "ticker", "name", "quantity", "avg_buy_price"]
