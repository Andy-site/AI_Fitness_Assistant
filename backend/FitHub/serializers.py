from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import CustomUser

class CustomRegisterSerializer(RegisterSerializer):
    name = serializers.CharField(max_length=255)
    age = serializers.IntegerField(required=False, allow_null=True)
    height = serializers.FloatField(required=False, allow_null=True)
    weight = serializers.FloatField(required=False, allow_null=True)
    goal = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'name': self.validated_data.get('name', ''),
            'age': self.validated_data.get('age'),
            'height': self.validated_data.get('height'),
            'weight': self.validated_data.get('weight'),
            'goal': self.validated_data.get('goal', ''),
        })
        return data

    def save(self, request):
        user = super().save(request)
        user.name = self.validated_data.get('name', '')
        user.age = self.validated_data.get('age')
        user.height = self.validated_data.get('height')
        user.weight = self.validated_data.get('weight')
        user.goal = self.validated_data.get('goal', '')
        user.save()
        return user
