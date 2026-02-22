from rest_framework import serializers
from .models import Stock, Holding


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["id", "ticker", "name"]


class HoldingSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(source="stock.ticker", read_only=True)
    name = serializers.CharField(source="stock.name", read_only=True)

    class Meta:
        model = Holding
        fields = ["id", "ticker", "name", "quantity", "avg_buy_price"]


class HoldingAddSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20)
    name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=4)
    buy_price = serializers.DecimalField(max_digits=12, decimal_places=2)
