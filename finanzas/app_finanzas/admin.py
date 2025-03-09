from django.contrib import admin
from django.db import models
from .services import ResumenFinanciero
from django.utils.html import format_html

from .models import Categoria, Ingreso, Gasto, Ahorro, Presupuesto, Transaccion
admin.site.register(Categoria)
admin.site.register(Ingreso)
admin.site.register(Gasto)
admin.site.register(Ahorro)
admin.site.register(Presupuesto)
admin.site.register(Transaccion)

