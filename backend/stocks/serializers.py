from rest_framework import serializers
from .models import Stock, Holding


class StockSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="ticker", read_only=True)

    class Meta:
        model = Stock
        fields = ["id", "symbol", "name"]


class HoldingSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source="stock.ticker", read_only=True)
    name = serializers.CharField(source="stock.name", read_only=True)

    class Meta:
        model = Holding
        fields = ["id", "symbol", "name", "quantity", "avg_buy_price"]


class HoldingAddSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20)
    name = serializers.CharField(
        max_length=200, required=False, allow_blank=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=4)
    buy_price = serializers.DecimalField(max_digits=12, decimal_places=2)


class HoldingUpdateSerializer(serializers.Serializer):
    quantity = serializers.DecimalField(max_digits=12, decimal_places=4, required=False)
    avg_buy_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Send quantity and/or avg_buy_price.")

        if "quantity" in attrs and attrs["quantity"] <= 0:
            raise serializers.ValidationError({"quantity": "Must be > 0."})

        if "avg_buy_price" in attrs and attrs["avg_buy_price"] <= 0:
            raise serializers.ValidationError({"avg_buy_price": "Must be > 0."})

        return attrs