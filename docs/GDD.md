# Game Design Document

## Proyecto: Harmony Puzzle (nombre provisional)

> Basado en el ejercicio de armonía de Jorge Triana, músico cubano.
> Diseñado para estudiantes de jazz y teoría musical de todos los niveles.

---

## 1. Visión del juego

Un juego de puzzle musical que gamifica el ejercicio de reconocimiento armónico de Jorge Triana. El jugador recibe una matriz con una nota fija en la diagonal y debe completar las celdas restantes identificando correctamente qué notas componen el acorde o escala planteado, sabiendo desde qué grado parte cada columna.

El juego entrena al músico para conocer "quién es quién de cada cual": reconocer los grados de cualquier acorde o escala desde cualquier nota, no solo desde la raíz.

---

## 2. Mecánica central

### La matriz

- Es una grilla de N×N donde N es el número de notas del acorde o escala.
- **Filas**: representan los grados del acorde/escala, de abajo hacia arriba (1°, 3°, 5° en una triada).
- **Columnas**: cada columna es un acorde/escala completo a resolver.
- **Diagonal**: contiene la nota dada (fija). Cada celda de la diagonal está en un grado distinto de su columna.

### Ejemplo: triada mayor con Do en la diagonal

```
Grado  Col 1  Col 2  Col 3
  5°  [  G  |  Eb  |  C  ]
  3°  [  E  |  C   |  A  ]
  1°  [  C  |  Ab  |  F  ]
```

- **Columna 1**: Do es el 1°. Acorde: Do mayor → E, G.
- **Columna 2**: Do es el 3°. ¿Qué acorde mayor tiene Do como tercera? → Ab mayor → Ab, Eb.
- **Columna 3**: Do es el 5°. ¿Qué acorde mayor tiene Do como quinta? → Fa mayor → F, A.

### Escala de matrices según contenido

| Contenido               | Tamaño de matriz | Notas por acorde/escala |
|-------------------------|------------------|--------------------------|
| Triadas                 | 3×3              | 3                        |
| Tétradas (7ª)           | 4×4              | 4                        |
| Pentatónicas            | 5×5              | 5                        |
| Hexáfonas               | 6×6              | 6                        |
| Modos / escalas de 7    | 7×7              | 7                        |
| Acordes alterados       | 7×7              | 7 (1,3,b5,#5,b7,b9,#9)  |
| Escala disminuida       | 8×8              | 8                        |

---

## 3. Contenido musical

### Triadas

- Mayor, menor, aumentada, disminuida
- Suspendidas: sus2, sus4

### Tétradas (acordes de 4 notas)

- Mayor con 6ª (maj6)
- Mayor con 7ª mayor (maj7)
- Dominante (7)
- Dominante suspendido (7sus4)
- Menor con 7ª (m7)
- Menor con 7ª mayor (mMaj7)
- Semidisminuido (m7b5)
- Disminuido con 7ª (dim7)

### Acordes extendidos y alterados

- Dominante con tensiones: 9, #9, b9, 11, #11, 13, b13
- Dominante alterado: 1, 3, b5, #5, b7, b9, #9

### Escalas y modos

- **Modos de la escala mayor**: Jónico, Dórico, Frigio, Lidio, Mixolidio, Eólico, Locrio
- **Modos de la menor armónica**: los 7 modos
- **Modos de la menor melódica**: los 7 modos (incluye Lidio dominante, Superlocrio, etc.)
- **Pentatónicas**: mayor, menor
- **Hexáfona (escala de tonos enteros)**
- **Disminuida**: half-whole, whole-half

---

## 4. Sistema de puntuación

### Tipos de respuesta

| Tipo            | Descripción                                                                 | Puntos base |
|-----------------|-----------------------------------------------------------------------------|-------------|
| **Correcta**    | Nota correcta con la ortografía armónica adecuada al contexto               | 3           |
| **Enarmónica**  | Pitch correcto, pero nombre incorrecto (ej: G# en lugar de Ab)              | 1           |
| **Incorrecta**  | Pitch y nombre incorrectos                                                  | 0           |

> **Ejemplo de enarmónico**: En un acorde de Ab mayor, la tercera es C. Si el jugador escribe B#, el sonido es el mismo, pero B# es la tercera de G# mayor, no de Ab mayor. El sistema reconoce la equivalencia enarmónica, pero penaliza la escritura incorrecta.

### Modificadores de dificultad

El jugador puede activar o desactivar ayudas antes de comenzar el puzzle. Cada ayuda que se desactiva aplica un multiplicador al puntaje total de la partida:

| Ayuda desactivada                        | Multiplicador |
|------------------------------------------|---------------|
| Sin etiquetas de grados (filas sin 1°/3°/5°) | ×1.5      |
| Sin teclado de piano                     | ×1.5          |
| Sin ambas ayudas                         | ×2.5          |

### Entrada de notas

Existen dos métodos de entrada, con diferentes implicaciones de dificultad:

1. **Teclado de piano** (en pantalla): el jugador toca la tecla. Solo determina el pitch; el sistema infiere la ortografía más probable según el contexto. Penalizado con menos puntos base.

2. **Selección por lista** (dos pasos):
   - Paso 1: selecciona la nota natural (C, D, E, F, G, A, B)
   - Paso 2: selecciona la alteración (𝄫 bb, ♭ b, ♮ natural, ♯ #, 𝄪 ##)
   - Este método valida tanto el pitch como la ortografía armónica, permitiendo alcanzar los 3 puntos por celda.

---

## 5. Progresión y desbloqueo de contenido

### Modo Aprendizaje

El contenido se presenta de forma progresiva. El jugador no puede saltarse etapas.

#### Etapa 1 — Triadas básicas

1. Solo acordes mayores (notas sin alteraciones complejas)
2. Solo acordes menores
3. Mezcla aleatoria de mayor y menor (sin dobles alteraciones)
4. Acordes suspendidos (sus2, sus4)
5. Acordes aumentados
6. Acordes disminuidos
7. Mezcla aleatoria de todas las triadas

> Al completar la Etapa 1: se desbloquea el **Modo Libre — Triadas** y se habilita la **Etapa 2**.

#### Etapa 2 — Tétradas

1. Maj7 → 6ª → Dom7 → 7sus4 → m7 → mMaj7 → m7b5 → dim7
2. Mezcla aleatoria de tétradas

> Al completar la Etapa 2: se desbloquea el **Modo Libre — Tétradas** y se habilita la **Etapa 3**.

#### Etapas siguientes

- El patrón se repite para acordes extendidos, escalas pentatónicas, modos y escalas simétricas.
- Cada etapa completada añade ese contenido al **Modo Libre**.

### Modo Libre

El jugador selecciona:

- **Tipo de contenido**: los que ha desbloqueado (triadas, modos, etc.)
- **Nota de la diagonal**: fija o aleatoria
- **Ayudas**: activa/desactiva grados y teclado
- **Cantidad de puzzles por sesión**

---

## 6. Perfil de usuario

- Registro del progreso en el Modo Aprendizaje (etapa y sub-etapa actual)
- Contenido desbloqueado para el Modo Libre
- Historial de puntajes por sesión
- Estadísticas: porcentaje de respuestas correctas, enarmónicas e incorrectas por tipo de acorde/escala
- Racha de días de práctica

---

## 7. Plataforma

La decisión de plataforma es un paso posterior que requiere evaluar las opciones. Factores a considerar:

- **Alcance**: se desea cobertura multiplataforma (móvil, web, desktop)
- **Stack tecnológico**: a definir según recursos y audiencia prioritaria
- **Prioridad inicial**: por definir (posiblemente web como MVP por accesibilidad)

---

## 8. Nombre del juego

Aún por definir. Elementos conceptuales a combinar:

- Armonía / Harmony
- Puzzle / Sudoku
- Notas / Grades / Degrees
- Referencia al jazz o a la música

> Candidatos preliminares: *HarmoniQ*, *Chord Grid*, *NoteGrid*, *Degree Puzzle*, *Armonik*

---

## 9. Monetización

### Contexto

El público objetivo es acotado (estudiantes y profesores de jazz y teoría musical). El proyecto nace como un desafío personal con vocación de servicio a los músicos, por lo que las decisiones de monetización deben equilibrar sostenibilidad con accesibilidad.

---

### Opción 1 — Gratuito con donación voluntaria

El juego es completamente gratuito. Se incluye un botón o pantalla de donación voluntaria.

| | |
| --- | --- |
| **A favor** | Cero fricción. Máxima accesibilidad. Coherente con la motivación altruística del proyecto. |
| **En contra** | La tasa de donación espontánea en proyectos de nicho es muy baja (típicamente <1% de usuarios). Difícilmente cubre costos de hosting si el proyecto escala. |

---

### Opción 2 — Freemium con precio fijo

Versión gratuita con contenido limitado (por ejemplo, solo triadas). Versión Pro con contenido completo a un precio único.

| | |
| --- | --- |
| **A favor** | Propuesta de valor clara. El usuario sabe exactamente qué paga y qué obtiene. Modelo de ingresos predecible. |
| **En contra** | El precio lo es todo: muy alto aleja a estudiantes, muy bajo no es sostenible. Requiere pasarela de pago desde el día uno. |

---

### Opción 3 — Freemium con donación mínima para Pro

Versión gratuita con contenido limitado. Para acceder al contenido completo, el usuario realiza una donación con un monto mínimo sugerido, pero puede elegir donar más.

| | |
| --- | --- |
| **A favor** | Elimina la barrera del precio rígido. Genera buena voluntad. Funciona bien cuando hay comunidad o sentido de pertenencia. |
| **En contra** | El pago promedio en modelos "paga lo que quieras" tiende a ser menor que un precio fijo. Más complejo de comunicar y de implementar. |

---

### Opción 4 — Gratis para estudiantes, licencia para profesores/instituciones

El juego es gratuito para todos. Los profesores o escuelas que quieran usarlo como herramienta didáctica (con gestión de grupos, seguimiento de progreso de alumnos, asignación de ejercicios) pagan una licencia anual.

| | |
| --- | --- |
| **A favor** | Alinea el modelo de negocio con el impacto real del proyecto. Un profesor que asigna el juego a 30 alumnos genera mucho más valor que un estudiante individual. Respeta la motivación altruística sin renunciar a la sostenibilidad. |
| **En contra** | Requiere desarrollar funcionalidades de aula (gestión de grupos, panel docente), lo que aumenta el alcance del proyecto significativamente. |

---

### Propuesta recomendada

Dado el perfil del proyecto (nicho pequeño, motivación de impacto, desarrollo personal), se recomienda una combinación de **Opción 2 + Opción 4**:

1. **Triadas siempre gratis** para todos, sin condiciones.
2. **Desbloqueo Pro con pago único** a un precio accesible (referencia: €5–€10), que habilita todo el contenido.
3. **Licencia docente** como segunda línea de ingresos, orientada a profesores e instituciones que usen el juego en clase, con funcionalidades de aula adicionales.

Este modelo maximiza el acceso para estudiantes individuales, es simple de comunicar, y abre una vía de sostenibilidad real sin depender de donaciones espontáneas.

> **Pendiente**: validar el precio del Pro y el alcance mínimo viable de la licencia docente antes de comprometer arquitectura.

---

## 10. Viabilidad del proyecto

### Perfil del autor

- Músico con formación avanzada en jazz y teoría musical
- Ingeniero en Computación / Arquitecto de Software
- Ingeniero Civil Industrial
- Amplia experiencia en desarrollo de sistemas empresariales
- Primera aproximación al desarrollo mobile y de videojuegos

### Evaluación

Este proyecto es viable como desarrollo personal asistido por IA (Claude Code). La combinación de perfiles del autor es inusualmente adecuada para este tipo de producto:

- **Dominio musical propio**: la lógica central del juego (grados, enarmonía, modos, acordes) no requiere investigación externa. El autor es el experto del dominio.
- **Arquitectura de software**: permite tomar decisiones estructurales correctas y evaluar el código generado con criterio.
- **No es un videojuego tradicional**: no hay motor de física, gráficos 3D ni game loop en tiempo real. La complejidad técnica se asemeja más a una aplicación educativa con mecánicas de juego.

### Riesgos identificados

1. **Elección del stack tecnológico**: es la decisión más crítica. Una elección incorrecta de plataforma tiene costo acumulativo durante todo el desarrollo. Requiere análisis previo a escribir código.
2. **Despliegue móvil**: App Store y Google Play implican procesos de revisión, certificados, políticas de pago (Apple cobra 30% en compras in-app) y ciclos de actualización lentos. Territorio nuevo con burocracia propia.
3. **Monetización in-app en móvil**: más restrictiva y compleja que en web debido a las políticas de las tiendas.

### Recomendación de arranque

Comenzar por **web** con una PWA (Progressive Web App). Ventajas:

- Funciona en móvil desde el navegador sin pasar por las tiendas
- Permite validar el juego con usuarios reales antes de invertir en desarrollo nativo
- Si hay tracción, se puede migrar o envolver con Capacitor o Tauri

**MVP sugerido**: lógica del juego + UI web + perfil local (sin backend). Alcanzable en semanas.

> **Pendiente**: definir stack tecnológico.

---

## 11. Créditos de origen

El ejercicio base fue enseñado por **Jorge Triana**, músico cubano, en una clase de arreglos a cuatro voces para Jazz durante su paso por Chile. La adaptación al formato de juego es una extensión del autor de este proyecto.

---

*Documento en desarrollo — versión 0.1*
