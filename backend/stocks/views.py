from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.decorators import api_view
# Create your views here.
from rest_framework.permissions import IsAuthenticated


permission_classes = [IsAuthenticated]


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "You are authenticated",
            "user": request.user.username
        })
