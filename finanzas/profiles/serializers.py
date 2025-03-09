from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import random
import string


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token


class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField()

    def set_new_password(self):
        new_password = "".join(
            random.choices(string.ascii_letters + string.digits, k=8)
        )
        self.validated_data["new_password"] = new_password
        return new_password


class ProfileCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["username", "password", "email"]

    def validate_email(self, value):
        existing_email = Profile.objects.filter(email=value).exists()
        if existing_email:
            raise serializers.ValidationError(
                "Ya existe un usuario con este correo electrónico."
            )
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data.get("password"))
        user = super(ProfileCreationSerializer, self).create(validated_data)
        if user:
            return {"success": True, "message": "Usuario registrado exitosamente"}
        else:
            return {"success": False, "message": "Error al registrar usuario"}


class ForgotPasswordSerializerCustom(serializers.Serializer):
    username = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        # Verifica si el usuario existe en el modelo User, no en Profile
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El usuario no existe")
        return value

    def save(self):
        username = self.validated_data["username"]
        new_password = self.validated_data["new_password"]

        # Obtén el usuario de la base de datos
        user = User.objects.get(username=username)

        # Encripta y guarda la nueva contraseña
        user.password = make_password(new_password)
        user.save()

        return {
            "success": True,
            "message": "La contraseña ha sido actualizada exitosamente.",
        }


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "username", "email"]
        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        # Actualiza los campos solo si se proporciona un nuevo valor que no esté vacío
        for attr, value in validated_data.items():
            if value is not None and value != "":
                setattr(instance, attr, value)

        # Guarda el objeto actualizado
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user