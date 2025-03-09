from django.db.models import Sum
from django.utils.timezone import now
from .models import Ingreso, Gasto, Ahorro
import locale

# Diccionario de meses en español
MESES = {
    1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
    5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
    9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
}

class ResumenFinanciero:
    @staticmethod
    def obtener_resumen(usuario, mes=None, anio=None):
        # Si no se envían mes y año, usar los actuales
        if mes is None:
            mes = now().month
        if anio is None:
            anio = now().year

        # Convertimos a enteros en caso de que lleguen como strings desde el formulario
        try:
            mes = int(mes)
            anio = int(anio)
        except ValueError:
            mes = now().month
            anio = now().year

        total_ingresos = Ingreso.objects.filter(
            usuario=usuario, fecha__month=mes, fecha__year=anio
        ).aggregate(Sum('cantidad'))['cantidad__sum'] or 0

        total_gastos = Gasto.objects.filter(
            usuario=usuario, fecha__month=mes, fecha__year=anio
        ).aggregate(Sum('cantidad'))['cantidad__sum'] or 0

        total_ahorros = Ahorro.objects.filter(
            usuario=usuario, fecha__month=mes, fecha__year=anio
        ).aggregate(Sum('cantidad'))['cantidad__sum'] or 0

        presupuesto_restante = total_ingresos - total_gastos

        return {
            'mes': mes,
            'anio': anio,
            'nombre_mes': MESES.get(mes, "Desconocido"),  # Nombre del mes
            'total_ingresos': total_ingresos,
            'total_gastos': total_gastos,
            'total_ahorros': total_ahorros,
            'presupuesto_restante': presupuesto_restante
        }
