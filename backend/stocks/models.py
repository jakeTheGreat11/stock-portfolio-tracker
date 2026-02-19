from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Stock(models.Model):
    ticker = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)


class Holding(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="holdings")
    stock = models.ForeignKey(
        Stock, on_delete=models.CASCADE, related_name="holdings")
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    avg_buy_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "stock"], name="unique_user_stock")
        ]
