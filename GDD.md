# Documento de Diseño de Juego (GDD)

**Título del Juego:** Romeo, you're small
**Versión del Documento:** 2.0
**Fecha de Última Modificación:** 11/01/2025
**Autor / Estudio:** Rafael Alberto Serrato Morales/RaphaelAlbertoTheStegosaurus

---

## 1. Introducción

### 1.1. Resumen del Concepto 
> Un juego de Puzzle/Plataforma con agilidad y movimiento para superar llegar a la meta usando los objetos en el escenario pero a su vez obteniendo objetos que te impedirán conseguir tu meta 

### 1.2. Propósito y Visión

* **Visión del Juego:** Crear la experiencia de desarrollar habilidades entre destreza y agilidad al jugar.
* **Público Objetivo:** Al honorable publico de la LittleJS Engine Jam y al honorable jurado de la JAM.
* **Género:** Plataformas 2D, Acción, Puzzle.
* **Plataformas:** Navegador.

### 1.3. Pilares de Diseño

1.  **Moverse:** El control de personaje debe ser inmediato para llegar del punto A al punto B.
2.  **Coger los items del escenario:** Debes de recoger la mayoría de ramas para aumentar el tamaño de tus zancos caseros o sino los perros te alcanzaran.  
3.  **El tiempo es primordial:**Ya que si el tiempo pasa tus zancos disminuirán de tamaño tras ser devorados lentamente ppr los perros, ademas que recogerán las herramientas para devorar mas los zancos. 

### 1.4. Alcance del Proyecto 

* **Duración Estimada:** 9 Dias.
* **Contenido Mínimo Viable (MVP):** 1 nivel funcional.

---

## 2. Jugabilidad (Gameplay)

### 2.1. Mecánicas de Juego Principales

#### 2.1.1. Movimiento Básico
* **Moverse:** El Jugador podrá moverse derecha e izquierda sin ningún problema.
* **Saltar:** EL jugador podrá saltar para alcanzar los items que se encuentren fuera de su alcance y poder dar un salto a la plataforma de meta.

#### 2.1.2. Mecanica de la manipulacion de stilts
* **Variables**
- * **STILT_STAR_HEIGTH** equivalente a 5 Unidades al principio.
- * **current_stilt_height** es equivalente a el valor actual de la altura de las stilts y como mínimo sera 0.1 que sera el valor de la derrota.
- * **STILT_GROW_UP** equivalente a 2 unidades que se agregaran cada vez que colisionas con el objeto Stick
- * **velocity_time** Es el valor del intervalo de tiempo en el que se te quitara altura a **current_stilt_height** con el valor de **velocity_unity**, cuyo valor empieza en 15s pero ira bajando hasta llegar a 1s como mínimo.
- * **velocity_unity** Es el valor de la unidad que restara a **current_stilt_height** cada vez que pase el intervalo de tiempo de **velocity_unity**, empezando en 0.1 unidades y llegando a 1.5 unidades como máximo.
- * **DogChihuahua** cada collision resta -1 el valor de **velocity_time** 
- * **WoodTools** cada collision aumenta +0.1 el valor de **velocity_unity** 
- * **Stick** cada collision aumenta +2 el valor de **current_stilt_height**

#### 2.1.3 Spawners
* **Spawn de Sticks** Estos aparecerán cada 0.65s en  posiciones aleatorias en el escenario mientras saltes abecés estar altas o bajas solo puedes cojeras el personaje no los stilt. 
* **Spawn de Dogs Chihuahua** Estos aparecerán cada 2s en pociones en el suelo que estos patrullaran y cuando Estes cerca te seguirán hasta reducir el tiempo de la velocidad con la que reducen las stilts velocidad=cantidad/tiempo
* **Spawn de Wood Tools** Estos aparecerán de forma flotante cada 3s en el escenario y estos solo podrán ser recogidos cor la nube de perros que aumentara la cantidad de la velocidad que consumen tus stilts velocidad=cantidad/tiempo


### 2.2. Controles

| Acción  | PC (Teclado/Mouse)    | Movil (Touch)             |
| :------ | :-------------------- | :------------------------ |
| Moverse | A,D/Derecha,Izquierda | Swipe Derecho o Izquierdo |
| Salto   | W / Arriba            | Doble touch               |
| Pausa   | Presionando el Botón  | Presionando el Botón      |

### 2.3. Progresión y Rejugabilidad

* **Estado Inicial:** El jugador iniciara con el valor de 5 unidades del tamaño de los stilts pero no es suficiente para alcanzar el balcón el cual deberá recoger las ramas para aumentar mas 2 unidades a su valor pero este valor actual se vera afectado por la reduction de los still que variara entre que velocidad se resta su stilt 
* **Meta-Progresión:** El jugador ganara cuando pueda alcanzar el balcón donde esta su novia podrá usar un salto para llegar y liberarse las stilts
* **Derrota** El jugador perderá su las stilts son demasiadamente pequeñas que los perros chihuahuas te alcanzaran y te morderán.

---

## 3. Historia y Narrativa

### 3.1. Premisa de la Historia 
Un joven que va a ver a su novia a escondidas y este entra su casa, pero como es muy pequeño para verla en su balcón usa las ramas de un árbol para hacerse de unos zancos, pero al abrirse una puerta sale una jauría de perros chihuahuas y este tiene que poder a ver a su novia o sufrir de que lo muerdan los perros. 

### 3.2. Mundo del Juego (Setting)
* **Ambientación:** Una casa Grande estilo colonial, con un extenso patio, con un árbol grande de fondo.

### 3.3. Personajes

* **Protagonista (Small Romeo):** Un chaval medio vago, galán engreído pero aveces es gracioso cuando la vida le da una lección.
* **La Novia** Una chica hermosa que le gusta estudiar y que ama a Small Romeo a pesar de estar Bajo de altura.

---
## 4. Arte y Audio

### 4.1. Estilo Artístico
* **Dirección de Arte:** **Pixel Art** Raphael Alberto
* **Arte de Sprites** Fue con uso de prompt a Gemini para agilizar el trabajo y algunos como la ramas y los stilts fueron creados por su servidor en la pagina de [Piskelapp](https://www.piskelapp.com)
* **Animacion** Fue una creación de frames a frames de **Gemini** con prompts de los sprites ya creados por **Gemini** y bocetos hechos a libreta para crear la escenas o el frame  que al final en vez de usar una IA para que se me generar una animación recurrí a crear la animación con **HTML/CSS/JS** y grabarlo con la extension de **Live Screen Recorder**, 

### 4.2. Interfaz de Usuario (UI) y Experiencia de Usuario (UX)
* **Estilo del UI:** Minimalist pero con el fondo que cuente la historia del juego o en que parte del juego e=te encuentras con la ubicación de los botones que no cubra las imágenes según el menu donde te ecuestres.
* **HUD:**
    * Medidor de Stilt (Esquina superior izquierda).
    * Boton de Pausa (Esquina superior izquierda).
### 4.3. Sonido
* **Dirección Musical:** Pieza musical en bucle tomada de [Pixabay](https://pixabay.com/) por el compositor Maksym Maiko.
* **SFX:** Algunos eggectos de sonido fueron tomados de los ejemplos creados de Zzfx de LittleJS Engine y otros fueron de [freesound](https://freesound.org/).

---

## 5. Requisitos Técnicos

### 5.1. Tecnología y Herramientas
* **Motor de Juego:** LittleJS Engine.
* **Lenguajes de Programación:** Vainilla JavaScript.
* **Control de Versiones:** Git (GitHub/GitLab).
* **Editor** VSCode

### 5.2. Requisitos de Hardware
* **Mínimos:** Por el momento solo es compatible en computadora. 

---

## 6. Gestión del Proyecto


### 6.1. Historial de Versiones

| Versión | Fecha      | Autor | Cambios Clave                                                          |
| :------ | :--------- | :---- | :--------------------------------------------------------------------- |
| 0.1     | 24/10/2025 | RASM  | Primer borrador del proyecto e interaction con el motor de juego.      |
| 1.0     | 01/11/2025 | RASM  | Juego version Beta Terminado y con Deploy en GitHub Pages y Hostinger. |