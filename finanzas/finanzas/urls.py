from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from app_finanzas.views import (
    CategoriaViewSet, IngresoViewSet, GastoViewSet,
    AhorroViewSet, PresupuestoViewSet, ResumenFinancieroView, ResumenFinancieroActualView,UltimosMovimientosView, MovimientosMensualesView,
    IngresosMensualesView, GastosMensualesView, TransaccionViewSet, UsuarioActualView
)
from django.contrib import admin
from profiles.views import (
    CustomTokenObtainPairView,
    ProfileCreationView,
    ForgotPasswordCustomView,
    ProfileDetailView,
    PasswordResetView
)
from django.conf import settings
from django.conf.urls.static import static

# Configuración del router para vistas basadas en viewsets
router = routers.DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'ingresos', IngresoViewSet)
router.register(r'gastos', GastoViewSet)
router.register(r'ahorros', AhorroViewSet)
router.register(r'presupuestos', PresupuestoViewSet)
router.register(r'transacciones', TransaccionViewSet, basename='transaccion')


urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    path('resumen-financiero/', ResumenFinancieroView.as_view(), name='resumen-financiero'),
    path('resumen/actual/', ResumenFinancieroActualView.as_view(), name='resumen-financiero-actual'),
    path('ultimos-movimientos/', UltimosMovimientosView.as_view(), name='ultimos-movimientos'),
    path('movimientos-mensuales/', MovimientosMensualesView.as_view(), name='movimientos-mensuales'),
    path('ingresos-mensuales/', IngresosMensualesView.as_view(), name='ingresos-mensuales'),
    path('gastos-mensuales/', GastosMensualesView.as_view(), name='gastos-mensuales'),
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),

    # Autenticación con JWT
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Perfiles y usuarios
    path("api/register/", ProfileCreationView.as_view(), name="register"),
    path("api/forgot-password/", ForgotPasswordCustomView.as_view(), name="forgot_password"),
    path("api/reset-password/", PasswordResetView.as_view(), name="reset_password"),
    path("api/profile/<str:username>/", ProfileDetailView.as_view(), name="profile_detail"),
    
    # Autenticación de DRF (para la interfaz de navegación)
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)