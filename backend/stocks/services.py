from django.db import transaction
from .models import Stock, Holding


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
