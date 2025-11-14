# Asistente Virtual de Fitness - React Component

## 📋 Instalación

1. **Instalar dependencias:**
   ```bash
   cd react-components
   npm install
   ```

2. **Compilar el componente:**
   ```bash
   npm run build
   ```
   Esto generará `fitness-assistant.bundle.js` en la carpeta `js/`

## 🚀 Uso

Agregar al final de cualquier página HTML (antes del `</body>`):

```html
<!-- Contenedor para el asistente React -->
<div id="fitness-assistant-root"></div>

<!-- React y ReactDOM desde CDN -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Bundle del asistente -->
<script src="../js/fitness-assistant.bundle.js"></script>
```

## ✨ Características

- **Botón flotante** en la esquina inferior derecha
- **Chat interactivo** con respuestas automáticas
- **Base de conocimientos** sobre:
  - Entrenamiento y rutinas
  - Nutrición y dieta
  - Suplementos
  - Equipos de gimnasio
  - Consejos fitness
- **Respuestas rápidas** predefinidas
- **Animaciones suaves**
- **Responsive design**

## 🎨 Temas cubiertos

El asistente puede responder sobre:
- Cómo bajar de peso
- Cómo ganar masa muscular
- Rutinas de entrenamiento
- Nutrición y macros
- Suplementos (proteína, creatina, etc.)
- Equipos de gimnasio
- Cardio y ejercicio
- Consejos para principiantes
- Horarios de entrenamiento
- Precios y envíos

## 🔧 Desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```

## 📝 Personalización

Editar `FitnessAssistant.jsx` para:
- Agregar más keywords y respuestas en `knowledgeBase`
- Cambiar respuestas rápidas en `quickReplies`
- Modificar estilos y colores
- Agregar integración con API
