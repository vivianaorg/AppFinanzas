from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Categoria(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, null=True, blank=True)
    
    @classmethod
    def get_default_id(cls):
        categoria, _ = cls.objects.get_or_create(
            nombre="General", 
            defaults={"description": "Categoría por defecto"}
        )
        return categoria.id
    
    def __str__(self):
        return self.nombre

class Ingreso(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        default=Categoria.get_default_id  # Now returns ID instead of the object
    )
    fecha = models.DateField()
    
    def __str__(self):
        return f"Ingreso de {self.cantidad} - {self.usuario}"

class Gasto(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        default=Categoria.get_default_id  # Now returns ID instead of the object
    )
    fecha = models.DateField()
    
    def __str__(self):
        return f"Gasto de {self.cantidad} - {self.usuario}"

class Ahorro(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        default=Categoria.get_default_id  # Now returns ID instead of the object
    )
    fecha = models.DateField()
    
    def __str__(self):
        return f"Ahorro de {self.cantidad} - {self.usuario}"
    
class Presupuesto(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        default=Categoria.get_default_id  # Now returns ID instead of the object
    )
    monto_maximo = models.DecimalField(max_digits=10, decimal_places=2)
    mes = models.DateField()
    
    def __str__(self):
        return f"Presupuesto {self.categoria} - {self.usuario}"
    
class Transaccion(models.Model):
    TIPO_CHOICES = [
        ('ingresos', 'Ingresos'),
        ('gastos', 'Gastos'),
        ('ahorros', 'Ahorros'),
    ]
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='transacciones')
    importe = models.DecimalField(max_digits=10, decimal_places=2)
    comentarios = models.TextField(blank=True, null=True)
    fecha = models.DateField()
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_tipo_display()}: {self.importe} - {self.categoria.nombre}"
    
@receiver(post_save, sender=Transaccion)
def crear_ingreso_o_gasto(sender, instance, created, **kwargs):
    if created:
        if instance.tipo == 'ingresos':
            Ingreso.objects.create(
                usuario=instance.usuario,
                cantidad=instance.importe,
                categoria=instance.categoria,
                fecha=instance.fecha
            )
        elif instance.tipo == 'gastos':
            Gasto.objects.create(
                usuario=instance.usuario,
                cantidad=instance.importe,
                categoria=instance.categoria,
                fecha=instance.fecha
            )
        elif instance.tipo == 'ahorros':
            Ahorro.objects.create(
                usuario=instance.usuario,
                cantidad=instance.importe,
                categoria=instance.categoria,
                fecha=instance.fecha
            )
