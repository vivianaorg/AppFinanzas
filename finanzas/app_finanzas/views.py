from rest_framework import viewsets, permissions
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import status
from datetime import datetime
from django.db.models import Sum
from django.http import JsonResponse
from .models import Categoria, Ingreso, Gasto, Ahorro, Presupuesto,Transaccion
from .serializers import (
    CategoriaSerializer, IngresoSerializer, GastoSerializer, 
    AhorroSerializer, PresupuestoSerializer, TransaccionSerializer
)
from .services import ResumenFinanciero
import calendar

# 🔹 BaseViewSet para evitar código repetido
class BaseViewSet(viewsets.ModelViewSet):
    """Clase base para filtrar objetos por usuario autenticado."""
    
    def get_queryset(self):
        return self.queryset.filter(usuario=self.request.user)


# 🔹 CRUD AUTOMÁTICO PARA MODELOS USANDO VIEWSETS
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class IngresoViewSet(BaseViewSet):
    queryset = Ingreso.objects.all()
    serializer_class = IngresoSerializer

class GastoViewSet(BaseViewSet):
    queryset = Gasto.objects.all()
    serializer_class = GastoSerializer

class AhorroViewSet(BaseViewSet):
    queryset = Ahorro.objects.all()
    serializer_class = AhorroSerializer

class PresupuestoViewSet(BaseViewSet):
    queryset = Presupuesto.objects.all()
    serializer_class = PresupuestoSerializer


# 🔹 VISTA PERSONALIZADA PARA RESUMEN FINANCIERO USANDO APIView
class ResumenFinancieroView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Obtiene mes y año de la solicitud o usa los valores actuales
            mes = int(request.GET.get("mes", now().month))
            anio = int(request.GET.get("anio", now().year))

            # Obtiene ingresos y gastos del usuario autenticado en el mes y año dados
            ingresos = (
                Ingreso.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio)
                .aggregate(total=Sum("cantidad"))["total"]  
                or 0
            )
            gastos = (
                Gasto.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio)
                .aggregate(total=Sum("cantidad"))["total"]  
                or 0
            )
            ahorro = (
                Ahorro.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio)
                .aggregate(total=Sum("cantidad"))["total"]  
                or 0
            )

            # Calcula el ahorro (Ingresos - Gastos)
            presupuesto_restante = ingresos - gastos

            # Diccionario de nombres de meses
            meses = {
                1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
                5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
                9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
            }

            # Construye la respuesta JSON
            resumen = {
                "nombre_mes": meses.get(mes, "Desconocido"),
                "anio": anio,
                "total_ingresos": ingresos,
                "total_gastos": gastos,
                "presupuesto_restante": presupuesto_restante,
                "ahorros": ahorro,
            }

            return Response(resumen)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ResumenFinancieroActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            mes = now().month
            anio = now().year

            ingresos = Ingreso.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio).aggregate(total=Sum("cantidad"))["total"] or 0
            gastos = Gasto.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio).aggregate(total=Sum("cantidad"))["total"] or 0
            ahorro = Ahorro.objects.filter(usuario=request.user, fecha__month=mes, fecha__year=anio).aggregate(total=Sum("cantidad"))["total"] or 0


            return Response({
                "mes": mes,
                "anio": anio,
                "ingresos": ingresos,
                "gastos": gastos,
                "ahorros":ahorro,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# 🔹 AUTENTICACIÓN PERSONALIZADA CON TOKEN
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user_id": user.pk, "email": user.email})


# ✅ Crear token automáticamente al crear un usuario
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        try:
            Token.objects.create(user=instance)
        except Exception as e:
            print(f"Error al crear el token para {instance.username}: {e}")

class UltimosMovimientosView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener los últimos 10 ingresos
            ultimos_ingresos = Ingreso.objects.filter(
                usuario=request.user
            ).order_by('-fecha')[:10]
            
            # Obtener los últimos 10 gastos
            ultimos_gastos = Gasto.objects.filter(
                usuario=request.user
            ).order_by('-fecha')[:10]

            # Obtener los últimos 10 ahorros
            ultimos_ahorros = Ahorro.objects.filter(
                usuario=request.user
            ).order_by('-fecha')[:10]
            
            # Serializar los resultados
            ingresos_serialized = IngresoSerializer(ultimos_ingresos, many=True).data
            gastos_serialized = GastoSerializer(ultimos_gastos, many=True).data
            ahorros_serialized = AhorroSerializer(ultimos_ahorros, many=True).data
            
            # Combinar todos los movimientos
            todos_movimientos = []
            
            # Procesar ingresos
            for ingreso in ingresos_serialized:
                ingreso['tipo'] = 'ingreso'
                categoria_id = ingreso.get('categoria')
                ingreso['categoria_nombre'] = self.obtener_nombre_categoria(categoria_id)
                todos_movimientos.append(ingreso)
            
            # Procesar gastos
            for gasto in gastos_serialized:
                gasto['tipo'] = 'gasto'
                categoria_id = gasto.get('categoria')
                gasto['categoria_nombre'] = self.obtener_nombre_categoria(categoria_id)
                todos_movimientos.append(gasto)

            # Procesar ahorros
            for ahorro in ahorros_serialized:
                ahorro['tipo'] = 'ahorro'
                categoria_id = ahorro.get('categoria')
                ahorro['categoria_nombre'] = self.obtener_nombre_categoria(categoria_id)
                todos_movimientos.append(ahorro)
            
            # Ordenar y limitar a los 10 más recientes
            todos_movimientos.sort(key=lambda x: x['fecha'], reverse=True)
            ultimos_10_movimientos = todos_movimientos[:10]
            
            return Response({
                "movimientos": ultimos_10_movimientos
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def obtener_nombre_categoria(self, categoria_id):
        if categoria_id:
            try:
                categoria = Categoria.objects.get(id=categoria_id)
                return categoria.nombre
            except Categoria.DoesNotExist:
                return 'Sin categoría'
        return 'Sin categoría'
        
class MovimientosMensualesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener parámetros de la solicitud
            mes = int(request.query_params.get('mes', datetime.now().month))
            anio = int(request.query_params.get('anio', datetime.now().year))
            
            # Validar parámetros
            if mes < 1 or mes > 12:
                return Response({"error": "Mes inválido"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calcular el primer y último día del mes
            primer_dia = datetime(anio, mes, 1).date()
            ultimo_dia = datetime(anio, mes, calendar.monthrange(anio, mes)[1]).date()
            
            # Obtener ingresos del mes
            ingresos = Ingreso.objects.filter(
                usuario=request.user,
                fecha__gte=primer_dia,
                fecha__lte=ultimo_dia
            ).order_by('-fecha')[:10]
            
            # Obtener gastos del mes
            gastos = Gasto.objects.filter(
                usuario=request.user,
                fecha__gte=primer_dia,
                fecha__lte=ultimo_dia
            ).order_by('-fecha')[:10]
            
            # Obtener ahorros del mes
            ahorros = Ahorro.objects.filter(
                usuario=request.user,
                fecha__gte=primer_dia,
                fecha__lte=ultimo_dia
            ).order_by('-fecha')[:10]
            
            # Serializar los datos
            ingresos_serialized = IngresoSerializer(ingresos, many=True).data
            gastos_serialized = GastoSerializer(gastos, many=True).data
            ahorros_serialized = AhorroSerializer(ahorros, many=True).data
            
            # Procesar datos para formato uniforme
            todos_movimientos = []
            
            # Procesar ingresos
            for ingreso in ingresos_serialized:
                ingreso['tipo'] = 'ingreso'
                categoria_id = ingreso.get('categoria')
                if categoria_id:
                    try:
                        categoria = Categoria.objects.get(id=categoria_id)
                        ingreso['categoria_nombre'] = categoria.nombre
                    except Categoria.DoesNotExist:
                        ingreso['categoria_nombre'] = 'Sin categoría'
                todos_movimientos.append(ingreso)
            
            # Procesar gastos
            for gasto in gastos_serialized:
                gasto['tipo'] = 'gasto'
                categoria_id = gasto.get('categoria')
                if categoria_id:
                    try:
                        categoria = Categoria.objects.get(id=categoria_id)
                        gasto['categoria_nombre'] = categoria.nombre
                    except Categoria.DoesNotExist:
                        gasto['categoria_nombre'] = 'Sin categoría'
                todos_movimientos.append(gasto)
            
            # Procesar ahorros
            for ahorro in ahorros_serialized:
                ahorro['tipo'] = 'ahorro'
                categoria_id = ahorro.get('categoria')
                if categoria_id:
                    try:
                        categoria = Categoria.objects.get(id=categoria_id)
                        ahorro['categoria_nombre'] = categoria.nombre
                    except Categoria.DoesNotExist:
                        ahorro['categoria_nombre'] = 'Sin categoría'
                todos_movimientos.append(ahorro)
            
            # Ordenar todos los movimientos por fecha (más recientes primero)
            todos_movimientos.sort(key=lambda x: x['fecha'], reverse=True)
            
            # Limitar a los 10 más recientes
            movimientos_recientes = todos_movimientos[:10]
            
            return Response({
                "mes": mes,
                "anio": anio,
                "nombre_mes": calendar.month_name[mes],
                "movimientos": movimientos_recientes
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class IngresosMensualesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener parámetros de la solicitud
            mes = int(request.query_params.get('mes', datetime.now().month))
            anio = int(request.query_params.get('anio', datetime.now().year))
            
            # Validar parámetros
            if mes < 1 or mes > 12:
                return Response({"error": "Mes inválido"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calcular el primer y último día del mes
            primer_dia = datetime(anio, mes, 1).date()
            ultimo_dia = datetime(anio, mes, calendar.monthrange(anio, mes)[1]).date()
            
            # Obtener ingresos del mes
            ingresos = Ingreso.objects.filter(
                usuario=request.user,
                fecha__gte=primer_dia,
                fecha__lte=ultimo_dia
            ).order_by('-fecha')
            
            # Calcular el total de ingresos
            total_ingresos = ingresos.aggregate(total=Sum('cantidad'))['total'] or 0
            
            # Limitar a 10 para la lista
            ingresos_recientes = ingresos[:10]
            
            # Serializar los datos
            ingresos_serialized = IngresoSerializer(ingresos_recientes, many=True).data
            
            # Añadir nombres de categorías
            for ingreso in ingresos_serialized:
                categoria_id = ingreso.get('categoria')
                if categoria_id:
                    try:
                        categoria = Categoria.objects.get(id=categoria_id)
                        ingreso['categoria_nombre'] = categoria.nombre
                    except Categoria.DoesNotExist:
                        ingreso['categoria_nombre'] = 'Sin categoría'
                else:
                    ingreso['categoria_nombre'] = 'Sin categoría'
            
            return Response({
                "mes": mes,
                "anio": anio,
                "nombre_mes": calendar.month_name[mes],
                "ingresos": ingresos_serialized,
                "total": total_ingresos
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class GastosMensualesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Obtener parámetros de la solicitud
            mes = int(request.query_params.get('mes', datetime.now().month))
            anio = int(request.query_params.get('anio', datetime.now().year))
            
            # Validar parámetros
            if mes < 1 or mes > 12:
                return Response({"error": "Mes inválido"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calcular el primer y último día del mes
            primer_dia = datetime(anio, mes, 1).date()
            ultimo_dia = datetime(anio, mes, calendar.monthrange(anio, mes)[1]).date()
            
            # Obtener gastos del mes
            gastos = Gasto.objects.filter(
                usuario=request.user,
                fecha__gte=primer_dia,
                fecha__lte=ultimo_dia
            ).order_by('-fecha')
            
            # Calcular el total de gastos
            total_gastos = gastos.aggregate(total=Sum('cantidad'))['total'] or 0
            
            # Limitar a 10 para la lista
            gastos_recientes = gastos[:10]
            
            # Serializar los datos
            gastos_serialized = GastoSerializer(gastos_recientes, many=True).data
            
            # Añadir nombres de categorías
            for gasto in gastos_serialized:
                categoria_id = gasto.get('categoria')
                if categoria_id:
                    try:
                        categoria = Categoria.objects.get(id=categoria_id)
                        gasto['categoria_nombre'] = categoria.nombre
                    except Categoria.DoesNotExist:
                        gasto['categoria_nombre'] = 'Sin categoría'
                else:
                    gasto['categoria_nombre'] = 'Sin categoría'
            
            return Response({
                "mes": mes,
                "anio": anio,
                "nombre_mes": calendar.month_name[mes],
                "gastos": gastos_serialized,
                "total": total_gastos
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class TransaccionViewSet(viewsets.ModelViewSet):
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tipo', 'categoria', 'fecha']
    
    def get_queryset(self):
        # Solo mostrar transacciones del usuario actual
        return Transaccion.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
        categoria_id = self.request.data.get("categoria_id")  # Asegúrate de obtener el ID correctamente
        if categoria_id:
            try:
                categoria = Categoria.objects.get(id=categoria_id)  # Eliminamos el filtro por usuario
                serializer.save(categoria=categoria)
            except Categoria.DoesNotExist:
                raise serializers.ValidationError({"categoria_id": "La categoría no existe."})
        else:
            raise serializers.ValidationError({"categoria_id": "Este campo es obligatorio."})

class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"id": request.user.id, "username": request.user.username})