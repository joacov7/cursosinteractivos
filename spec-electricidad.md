# Spec: Módulo Electricidad — Curso con simulaciones

## 0. Principio de diseño (aplica a todo el módulo)

Cada tema sigue el mismo patrón de simulación:

1. **Magnitud requerida** — lo que exige la situación (corriente, en este caso)
2. **Capacidad del componente elegido** — lo que cada pieza soporta
3. **Elemento de protección** — dimensionado en relación al componente principal, nunca a la carga directamente
4. **Reglas de falla** — combinaciones inválidas y su efecto visual/conceptual

**Regla de seguridad transversal:** cada pantalla de simulación debe mostrar, antes de empezar, un recordatorio breve de seguridad real (ver sección 4). Cada resultado —correcto o fallido— cierra con una línea tipo: *"Esto es una simulación educativa. Una instalación real la debe hacer o supervisar un electricista matriculado."*

---

## 1. Currícula — Básico

### 1.1 Ley de Ohm y potencia
- Variables: V (tensión), I (corriente), R (resistencia), P (potencia)
- Fórmulas: `I = P/V`, `V = I·R`, `P = V·I`
- Simulación: circuito resistivo simple con multímetro virtual — el alumno mide y calcula la variable faltante

### 1.2 Cables y secciones (mm²) — *(ya implementado)*
- Variable: capacidad de corriente (ampacidad) según sección
- Falla: `load > capacidad_cable` → cable se calienta / humea

### 1.3 Térmicas (breakers) — protección del cable — *(ya implementado)*
- Falla "chica": `breaker < load` → corta apenas se usa
- Falla "grande": `breaker > capacidad_cable` → no protege al cable

### 1.4 Cortocircuito vs. sobrecarga
- Concepto clave: son fallas distintas y la térmica actúa distinto en cada una
- Simulación: dos escenarios lado a lado
  - **Sobrecarga**: corriente sube gradualmente por encima de lo normal → térmica tarda en cortar (curva térmica)
  - **Cortocircuito**: dos conductores se tocan directamente → corriente altísima instantánea → térmica corta de inmediato (disparo magnético)
- Falla pedagógica a evitar: que el alumno piense que ambas fallas son "lo mismo pero más fuerte"

### 1.5 Puesta a tierra
- Variable: `tiene_tierra` (boolean)
- Escenario: artefacto con falla de aislación (carcasa metálica energizada)
  - `tiene_tierra = false` → advertencia fuerte de riesgo de electrocución (conceptual, sin gráfica truculenta)
  - `tiene_tierra = true` → la corriente de falla circula a tierra, favorece que la protección corte
- Mensaje central: la tierra no "evita" la falla, da un camino seguro para que la protección actúe

### 1.6 Tomacorrientes y polaridad
- Norma argentina: 2P+T (IRAM 2073)
- Falla: fase y neutro invertidos → artefacto funciona pero queda con fase presente en partes que no deberían tenerla en reposo (riesgo al tocar, aunque el aparato "ande")

---

## 2. Currícula — Intermedio

### 2.1 Circuitos serie vs. paralelo
- Cálculo de resistencia equivalente en cada configuración
- Simulación: mismas lamparitas en serie (si una se quema, cortan todas) vs. paralelo (independientes)

### 2.2 Cálculo de cargas por ambiente
- El alumno recibe una planta de una casa con artefactos por ambiente
- Debe agrupar en circuitos separados (no todo en uno) y dimensionar cada circuito
- Falla: sobrecargar un único circuito con toda la casa

### 2.3 Disyuntor diferencial (RCD)
- Distinto propósito que la térmica: protege personas, no la instalación
- Variable: sensibilidad (mA) — doméstico 30mA
- Simulación: fuga de corriente a tierra por una falla de aislación
  - Con térmica sola → no corta (no es sobrecarga)
  - Con diferencial → corta en milisegundos
- Mensaje: térmica y diferencial cumplen roles distintos, un tablero necesita ambos

### 2.4 Tablero completo
- Componentes: llave general, diferencial general, térmicas seccionales por circuito
- Simulación: armar un tablero de una vivienda chica (circuito iluminación, circuito tomas, circuito AC/cocina) respetando jerarquía de protecciones

### 2.5 Iluminación
- Tipos de lámpara (incandescente, LED) y su consumo real
- Cálculo de circuito de iluminación con varias bocas de luz

---

## 3. Currícula — Avanzado

### 3.1 Trifásica
- Conceptos: 220V (fase-neutro) vs 380V (fase-fase), cuándo se necesita
- Simulación: identificar qué artefactos requieren trifásica vs monofásica

### 3.2 Motores — arranque
- Corriente de arranque (varias veces la nominal) vs corriente de régimen
- Arranque directo vs estrella-triángulo
- Falla típica: térmica dimensionada por corriente nominal salta en cada arranque (necesita curva o dimensionamiento distinto)

### 3.3 Arranque de compresores (puente con Refrigeración)
- Capacitor de arranque, relé de arranque
- Simulación: compresor no arranca — diagnóstico entre capacitor, relé, o protector térmico del motor

### 3.4 Mantenimiento industrial básico
- Lectura de planos unifilares
- Tableros con múltiples máquinas, selectividad de protecciones

### 3.5 Normativa (introducción a AEA)
- Qué es la AEA, por qué existe, cómo se usa como referencia (no memorizar articulado, sí saber cuándo consultarla)

---

## 4. Catálogo de componentes

Estructura de datos sugerida por componente:

```json
{
  "id": "cable_2_5",
  "categoria": "cables",
  "nombre": "Cable unipolar 2.5 mm²",
  "especificacion_tecnica": {
    "seccion_mm2": 2.5,
    "capacidad_A": 16,
    "aislacion": "PVC",
    "color_normalizado": "según fase/neutro/tierra (rojo/negro/marrón fase, celeste neutro, verde-amarillo tierra)"
  },
  "uso_correcto": "Circuitos de tomacorrientes de uso general",
  "riesgo_uso_incorrecto": "Sobrecalentamiento y falla de aislación si se usa en un circuito de mayor consumo",
  "nivel_curso": "basico"
}
```

### 4.1 Categorías a incluir

**Cables**
- Por sección: 1.5 / 2.5 / 4 / 6 / 10 mm²
- Unipolar vs. cable bipolar/tripolar (uso en prolongaciones vs. instalación fija)
- Código de colores normalizado (fase / neutro / tierra)

**Protecciones**
- Térmicas (breakers): curva B (iluminación/resistivo), curva C (mixto/pequeños motores), curva D (motores grandes, alta corriente de arranque)
- Disyuntor diferencial: sensibilidad 30mA (doméstico) / 300mA (industrial)
- Protector térmico de motor

**Tomacorrientes y fichas**
- Norma IRAM 2073 (2P+T argentino)
- Fichas industriales trifásicas

**Herramientas**
- Multímetro
- Pinza amperométrica
- Buscapolos (detector de tensión)
- Destornillador aislado
- Pelacables / prensa terminales

**Equipo de protección personal (EPP)**
- Guantes dieléctricos
- Calzado aislante
- Gafas de protección
- Tapete aislante (trabajo en tableros)

Cada componente del catálogo debe incluir, además de la especificación técnica: **para qué sirve**, **cuándo se usa mal** (y qué pasa), y **en qué nivel del curso se introduce** — así el catálogo funciona como referencia cruzada de las simulaciones, no como una lista aislada.

---

## 5. Seguridad — principio transversal

Regla de diseño: la seguridad no es un módulo aparte, es un elemento presente en cada pantalla.

- **Antes de cada simulación práctica**: recordatorio corto de la regla real equivalente (ej: "en la vida real, antes de tocar un tablero: cortar la llave general y verificar ausencia de tensión con el buscapolos")
- **EPP contextual**: cuando el catálogo introduce una herramienta o situación de riesgo, mostrar qué EPP corresponde
- **Ningún resultado de falla debe glorificarse ni banalizarse** (nada de humor sobre electrocución) — el tono es informativo y serio, sin ser alarmista
- **Cierre constante**: todo simulador termina con la aclaración de que es una herramienta educativa y que instalaciones reales las hace o supervisa un electricista matriculado

---

## 6. Estado actual vs. pendiente

**Ya construido (prototipo funcional):**
- Simulador de cable + térmica con las 3 reglas de falla (1.2 y 1.3)

**Pendiente de construir (este documento es la spec):**
- Resto de simulaciones de 1.1, 1.4, 1.5, 1.6 (básico)
- Todo el intermedio y avanzado
- Catálogo de componentes como base de datos consultable dentro de la app
- Sistema de quiz de cierre por tema
- Certificado al completar los 3 niveles
