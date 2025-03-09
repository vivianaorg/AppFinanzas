from rest_framework import serializers
from .models import Categoria, Ingreso, Gasto, Ahorro, Presupuesto, Transaccion
from django.contrib.auth.models import User

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class IngresoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())

    class Meta:
        model = Ingreso
        fields = '__all__'

    def create(self, validated_data):
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)

class GastoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())

    class Meta:
        model = Gasto
        fields = '__all__'

    def create(self, validated_data):
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)

class AhorroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ahorro
        fields = '__all__'

    def create(self, validated_data):
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)

class PresupuestoSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all())

    class Meta:
        model = Presupuesto
        fields = '__all__'

    def create(self, validated_data):
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = '__all__'
    
    def create(self, validated_data):
        # Asignar el usuario actual a la transacción
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)