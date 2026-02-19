from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Holding
from .serializers import HoldingSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_holdings_list(request):
    user = request.user
    user_holdings = Holding.objects.filter(user=user).select_related("stock")
    holdings_serialized = HoldingSerializer(user_holdings, many=True)
    return Response(holdings_serialized.data)
