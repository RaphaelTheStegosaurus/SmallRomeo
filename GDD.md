# Documento de Diseño de Juego (GDD)

**Título del Juego:** Small Romeo
**Versión del Documento:** 1.0
**Fecha de Última Modificación:** 24/10/2025
**Autor / Estudio:** Rafael Alberto Serrato Morales/RaphaelAlbertoTheStegosaurus

---

## 1. Introducción

### 1.1. Resumen del Concepto 
> Un juego de Puzzle/Plataforma con control de tiempo y agilidad para tratar de sobrevir el mayor tiempo para llegar a tu destino o terminar perdiendo.

### 1.2. Propósito y Visión

* **Visión del Juego:** Crear la experiencia de desarrollar habilidades entre destreza y agilidad al jugar.
* **Público Objetivo:** Al honorable publico de la LittleJS Engine Jam y al honorable jurado de la JAM.
* **Género:** Plataformas 2D, Acción, Puzzle.
* **Plataformas:** Navegador.

### 1.3. Pilares de Diseño

1.  **Moverse:** El control de personaje debe ser inmediato para llegar del punto A al punto B.
2.  **Coger los items del escenario:** Debes de recoger la mayoría de ramas para aumentar el tamaño de tus zancos caseros o sino los perros te alcanzaran.  
3.  **El tiempo es primordial:**Ya que si el tiempo pasa tus zancos disminuirán de tamaño tras ser devorados lentamente ppr los perros. 

### 1.4. Alcance del Proyecto 

* **Duración Estimada:** 5 Dias.
* **Contenido Mínimo Viable (MVP):** 1 nivel funcional.

---

## 2. Jugabilidad (Gameplay)

### 2.1. Mecánicas de Juego Principales

#### 2.1.1. Movimiento Básico
* **Moverse:** El Jugador podrá moverse derecha e izquierda sin ningún problema.
* **Saltar:** EL jugador podrá saltar para alcanzar los items que se encuentren fuer de su alcance.

#### 2.1.2. Manipulación del Tamaño de sus Zancos 
* **Aumentar:** Estos podrá aumentarlos cada vez que alcance un item le proporcionar una altura extra a su altura actual.
* **Disminución:** Pasando cada 2 segundos estos bajaran de altura y cuando la cantidad de remolino de perros aumente estos aumentaran la cantidad a bajar.


### 2.2. Controles

| Acción  | PC (Teclado/Mouse)    | Movil (Touch)             |
| :------ | :-------------------- | :------------------------ |
| Moverse | A,D/Derecha,Izquierda | Swipe Derecho o Izquierdo |
| Salto   | W / Arriba            | Doble touch               |

### 2.3. Progresión y Rejugabilidad

* **Meta-Progresión:** Entre intentos, el jugador tendra que llegar a la meta para completar este único nivel o superar el tiempo que sobrevive.

---

## 3. Historia y Narrativa

### 3.1. Premisa de la Historia 
Un joven que va a ver a su novia a escondidas y este entra su casa, pero como es muy pequeño para verla en su balcón usa las ramas de un árbol para hacerse de unos zancos pero su suegro lo ve por la ventana maltratando su árbol y envía a su jauría de perros chihuahuas y este tiene que poder a ver a su novia o sufrir de que lo muerdan los perros. 

### 3.2. Mundo del Juego (Setting)
* **Ambientación:** Una casa Grande estilo colonial, con un extenso patio, con un árbol grande de fondo.

### 3.3. Personajes

* **Protagonista (Small Romeo):** Un chaval medio vago, galán engreído pero aveces es gracioso cuando la vida le da una lección.
* **La Novia** Una chica hermosa que le gusta estudiar y que ama a Small Romeo a pesar de estar Bajo de altura.
* **El Suegro** El papa de la novia un tipo que lo mas posible trabajo en la CIA o en la Interpole, da mala espina a la hora de conocerlo.

---

[c] trabajr luego
## 4. Arte y Audio

### 4.1. Estilo Artístico
* **Dirección de Arte:** **Pixel Art** de alta resolución (16-bit) con iluminación dinámica moderna.
* **Paleta de Colores:** Contrastes fuertes; tonos fríos (azules/morados) para el tiempo normal y tonos cálidos (naranjas/rojos) al ralentizar el tiempo.
* **Referencias Visuales:** *Dead Cells*, *Enter the Gungeon*.

### 4.2. Interfaz de Usuario (UI) y Experiencia de Usuario (UX)
* **Estilo del UI:** Limpio, minimalista, con un toque futurista. La barra de Cronos debe ser el elemento más prominente del HUD.
* **HUD:**
    * Barra de Salud (Esquina superior izquierda).
    * Barra de Cronos (Centro inferior, gran visibilidad).
    * Iconos de Habilidades (Esquina inferior derecha).

### 4.3. Sonido
* **Dirección Musical:** Música electrónica y sintetizadores con influencias *synthwave* para el combate, y piezas ambientales con ecos para el *Hub*.
* **SFX:** Sonidos de ataque con mucho "punch" (*heavy hits*). Uso de efectos de eco y *pitch-down* al manipular el tiempo.

---

## 5. Requisitos Técnicos

### 5.1. Tecnología y Herramientas
* **Motor de Juego:** Unity 2023 LTS.
* **Lenguajes de Programación:** C#.
* **Control de Versiones:** Git (GitHub/GitLab).

### 5.2. Requisitos de Hardware
* **Mínimos (PC):** Intel Core i3 (4ta gen), 4GB RAM, Gráfica compatible con OpenGL 4.5.
* **Recomendados (PC):** Intel Core i5 (8va gen), 8GB RAM, NVIDIA GTX 1060.

---

## 6. Gestión del Proyecto

### 6.1. Hitos Principales

| Hito               | Fecha Límite | Estado | Descripción                                                                      |
| :----------------- | :----------- | :----- | :------------------------------------------------------------------------------- |
| **Alpha Jugable**  | 3 Meses      | TO DO  | Protagonista con todas las mecánicas principales. Nivel 1 completo.              |
| **Beta Cerrada**   | 8 Meses      | TO DO  | Contenido completo (3 niveles, 1 jefe, todas las habilidades) y balance inicial. |
| **Lanzamiento EA** | 12 Meses     | TO DO  | Versión 1.0 para Acceso Anticipado en Steam.                                     |

### 6.2. Historial de Versiones

| Versión | Fecha      | Autor  | Cambios Clave                                               |
| :------ | :--------- | :----- | :---------------------------------------------------------- |
| 0.1     | 01/10/2025 | J. Doe | Primer borrador. Se introduce la mecánica de Ralentización. |
| 1.0     | 24/10/2025 | J. Doe | GDD base finalizado. Listo para el inicio de la producción. |