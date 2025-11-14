// Asistente Virtual de Fitness - Versión standalone (sin JSX)

console.log("🤖 Cargando Asistente Fitness...");
console.log("React disponible:", typeof React !== "undefined");
console.log("ReactDOM disponible:", typeof ReactDOM !== "undefined");

const FitnessAssistant = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    {
      type: "assistant",
      text: "¡Hola! 👋 Soy tu asistente virtual de fitness. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Base de conocimientos
  const knowledgeBase = {
    saludos: {
      keywords: [
        "hola",
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "hey",
        "hi",
      ],
      responses: [
        "¡Hola! 😊 ¿En qué puedo ayudarte con tu entrenamiento hoy?",
        "¡Buen día! 💪 ¿Tienes alguna pregunta sobre fitness o nutrición?",
        "¡Hola! Estoy aquí para ayudarte con tus objetivos fitness. ¿Qué necesitas?",
      ],
    },
    proteina: {
      keywords: ["proteina", "protein", "suplemento", "batido", "whey"],
      responses: [
        "Para aumentar masa muscular, se recomienda consumir 1.6-2.2g de proteína por kg de peso corporal. Nuestros suplementos de proteína son 100% naturales y perfectos para post-entrenamiento. ¿Quieres ver nuestro catálogo?",
        "La proteína es esencial para la recuperación muscular. Tenemos proteína vegana, whey y caseína. ¿Cuál te interesa más?",
      ],
    },
    bajar_peso: {
      keywords: [
        "bajar de peso",
        "adelgazar",
        "perder peso",
        "quemar grasa",
        "definir",
      ],
      responses: [
        "Para perder peso de forma saludable:\n\n1. Déficit calórico moderado (300-500 cal)\n2. Entrenamiento de fuerza 3-4 veces/semana\n3. Cardio 2-3 veces/semana\n4. Dormir 7-8 horas\n5. Mantener proteína alta (1.8g/kg)\n\n¿Necesitas equipos para entrenar en casa?",
        "La clave está en combinar dieta equilibrada con ejercicio. Te recomiendo:\n- Caminadora o bicicleta para cardio\n- Pesas para mantener músculo\n- Proteína para saciedad\n\n¿Te muestro productos recomendados?",
      ],
    },
    aumentar_masa: {
      keywords: [
        "aumentar masa",
        "ganar musculo",
        "hipertrofia",
        "volumen",
        "crecer",
      ],
      responses: [
        "Para ganar masa muscular:\n\n1. Superávit calórico (+300-500 cal)\n2. Proteína: 2g por kg de peso\n3. Entrenamiento progresivo con pesas\n4. Descanso adecuado\n5. Suplementación: Proteína, creatina\n\n¿Quieres ver nuestros equipos de gimnasio?",
        "El entrenamiento con pesas es fundamental. Te recomiendo:\n- Set de mancuernas ajustables\n- Barra olímpica con discos\n- Banco ajustable\n- Suplementos: Proteína y Creatina\n\n¿Te interesa alguno?",
      ],
    },
    entrenamiento: {
      keywords: ["entrenar", "rutina", "ejercicio", "workout", "gimnasio"],
      responses: [
        "Tipos de entrenamiento según objetivos:\n\n💪 Fuerza: 3-5 reps, descansos largos\n🏋️ Hipertrofia: 8-12 reps, descansos medios\n🔥 Definición: 12-15 reps, descansos cortos\n🏃 Cardio: HIIT o steady state\n\n¿Qué objetivo tienes?",
        "Para principiantes recomiendo:\n- Full body 3x/semana\n- Ejercicios básicos (sentadillas, press, remo)\n- Progresión gradual\n\n¿Necesitas equipamiento?",
      ],
    },
    nutricion: {
      keywords: ["nutricion", "dieta", "alimentacion", "comer", "comida"],
      responses: [
        "Macros básicos:\n\n🥩 Proteínas: Construcción muscular\n🍚 Carbohidratos: Energía\n🥑 Grasas: Hormonas y salud\n\nDistribución típica:\n- Mantenimiento: 30% P / 40% C / 30% G\n- Definición: 40% P / 30% C / 30% G\n- Volumen: 25% P / 50% C / 25% G\n\n¿Necesitas suplementos nutricionales?",
        "Una dieta balanceada es clave. Recomiendo:\n- 4-5 comidas al día\n- Proteína en cada comida\n- Carbos antes/después del entreno\n- Hidratación constante\n\nTenemos suplementos naturales si te interesan.",
      ],
    },
    creatina: {
      keywords: ["creatina", "creatine", "suplemento creatina"],
      responses: [
        "La creatina es uno de los suplementos más estudiados:\n\n✅ Aumenta fuerza y potencia\n✅ Mejora recuperación\n✅ Segura y efectiva\n\nDosis: 5g diarios, cualquier hora\nNo necesita fase de carga\n\nTenemos creatina monohidrato pura. ¿Te interesa?",
      ],
    },
    equipos: {
      keywords: ["equipo", "maquina", "pesas", "mancuernas", "barra", "banco"],
      responses: [
        "Tenemos equipos para todos los niveles:\n\n🏠 Home gym:\n- Mancuernas ajustables\n- Banco multiposición\n- Bandas de resistencia\n\n🏋️ Profesional:\n- Power rack\n- Barra olímpica\n- Set de discos\n\n¿Qué tipo de equipo buscas?",
      ],
    },
    cardio: {
      keywords: ["cardio", "correr", "caminadora", "bicicleta", "eliptica"],
      responses: [
        "Equipos de cardio disponibles:\n\n🏃 Caminadora: Ideal para correr/caminar\n🚴 Bicicleta estática: Bajo impacto\n🎯 Elíptica: Trabajo completo, bajo impacto\n\nTodos incluyen monitor de frecuencia cardíaca.\n\n¿Cuál prefieres?",
      ],
    },
    precio: {
      keywords: ["precio", "costo", "cuanto cuesta", "valor", "$"],
      responses: [
        "Nuestros precios son muy competitivos:\n\n💊 Suplementos: desde $25\n🏋️ Equipos básicos: desde $30\n🏃 Máquinas cardio: desde $400\n🎯 Accesorios: desde $10\n\n¡Envío gratis en compras +$50!\n\n¿Qué producto te interesa?",
      ],
    },
    envio: {
      keywords: ["envio", "entrega", "delivery", "cuanto tarda"],
      responses: [
        "📦 Información de envíos:\n\n✅ Envío gratis en compras +$50\n✅ Entrega: 3-7 días hábiles\n✅ Equipos grandes: 10-15 días\n✅ Tracking incluido\n\n¿Tienes tu dirección lista para ordenar?",
      ],
    },
    principiante: {
      keywords: ["principiante", "empezar", "comenzar", "inicio", "nuevo"],
      responses: [
        "Para principiantes recomiendo:\n\n📋 Plan de entrenamiento:\n1. Full body 3x/semana\n2. Ejercicios básicos\n3. 30-45 min por sesión\n\n🛒 Equipo esencial:\n- Par de mancuernas\n- Colchoneta\n- Banda de resistencia\n\n💊 Suplementos:\n- Multivitamínico\n- Proteína (opcional)\n\n¿Por dónde quieres empezar?",
      ],
    },
    horario: {
      keywords: ["cuando entrenar", "horario", "mejor hora", "mañana o tarde"],
      responses: [
        "El mejor horario es el que puedas mantener consistente:\n\n🌅 Mañana:\n+ Mayor disciplina\n+ Metabolismo activo\n- Cuerpo frío\n\n🌆 Tarde:\n+ Fuerza máxima\n+ Cuerpo caliente\n- Más cansancio\n\nLo importante es la constancia. ¿Cuál horario prefieres?",
      ],
    },
  };

  const quickReplies = [
    "¿Cómo bajar de peso?",
    "¿Cómo ganar músculo?",
    "Rutinas de entrenamiento",
    "Suplementos recomendados",
    "Equipos para casa",
    "Nutrición fitness",
  ];

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    return "Interesante pregunta. Puedo ayudarte con:\n\n💪 Entrenamiento y rutinas\n🥗 Nutrición y dieta\n💊 Suplementos\n🏋️ Equipos de gimnasio\n🎯 Consejos fitness\n\n¿Sobre qué tema específico quieres saber?";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(inputValue);
      const assistantMessage = {
        type: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickReply = (reply) => {
    setInputValue(reply);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return React.createElement("div", null, [
    // Botón flotante
    React.createElement(
      "button",
      {
        key: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "animate-pulse-slow",
        style: {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: "99999",
          width: "70px",
          height: "70px",
          backgroundColor: "#059669",
          color: "white",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 40px rgba(5, 150, 105, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.backgroundColor = "#047857";
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.classList.remove("animate-pulse-slow");
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.backgroundColor = "#059669";
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.classList.add("animate-pulse-slow");
        },
      },
      isOpen
        ? React.createElement(
            "svg",
            {
              style: { width: "32px", height: "32px" },
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M6 18L18 6M6 6l12 12",
            })
          )
        : React.createElement(
            "svg",
            {
              style: { width: "32px", height: "32px" },
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
            })
          )
    ),

    // Ventana de chat
    isOpen &&
      React.createElement(
        "div",
        {
          key: "chat",
          style: {
            position: "fixed",
            bottom: "110px",
            right: "24px",
            zIndex: "99998",
            width: "384px",
            height: "600px",
            maxHeight: "80vh",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
          onWheel: (e) => {
            // Cuando el mouse está sobre el chat, evitar que el scroll afecte la página
            e.stopPropagation();
          },
        },
        [
          // Header
          React.createElement(
            "div",
            {
              key: "header",
              style: {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
              className: "text-white p-4",
            },
            React.createElement(
              "div",
              { className: "flex items-center gap-3" },
              [
                React.createElement(
                  "div",
                  {
                    key: "avatar",
                    className:
                      "w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl",
                  },
                  "💪"
                ),
                React.createElement(
                  "div",
                  { key: "title", className: "flex-1" },
                  [
                    React.createElement(
                      "h3",
                      { key: "h3", className: "font-bold text-lg" },
                      "Asistente Fitness"
                    ),
                    React.createElement(
                      "p",
                      { key: "p", className: "text-xs opacity-90" },
                      "Siempre disponible para ayudarte"
                    ),
                  ]
                ),
                React.createElement(
                  "button",
                  {
                    key: "close",
                    onClick: () => setIsOpen(false),
                    className:
                      "hover:bg-white/20 rounded-full p-1 transition-colors",
                  },
                  React.createElement(
                    "svg",
                    {
                      className: "w-5 h-5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                    },
                    React.createElement("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M6 18L18 6M6 6l12 12",
                    })
                  )
                ),
              ]
            )
          ),

          // Messages
          React.createElement(
            "div",
            {
              key: "messages",
              className: "flex-1 p-4 space-y-4 bg-gray-50",
              style: {
                overflowY: "auto",
                scrollBehavior: "smooth",
              },
            },
            [
              ...messages.map((message, index) =>
                React.createElement(
                  "div",
                  {
                    key: index,
                    className: `flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`,
                  },
                  React.createElement(
                    "div",
                    {
                      className: `max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === "user"
                          ? "text-white rounded-tr-none"
                          : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                      }`,
                      style:
                        message.type === "user"
                          ? { backgroundColor: "#059669" }
                          : {},
                    },
                    [
                      React.createElement(
                        "p",
                        {
                          key: "text",
                          className: "text-sm whitespace-pre-line",
                        },
                        message.text
                      ),
                      React.createElement(
                        "span",
                        {
                          key: "time",
                          className: `text-xs mt-1 block ${
                            message.type === "user"
                              ? "text-white/70"
                              : "text-gray-400"
                          }`,
                        },
                        formatTime(message.timestamp)
                      ),
                    ]
                  )
                )
              ),
              isTyping &&
                React.createElement(
                  "div",
                  {
                    key: "typing",
                    className: "flex justify-start",
                  },
                  React.createElement(
                    "div",
                    {
                      className:
                        "bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm",
                    },
                    React.createElement("div", { className: "flex gap-1" }, [
                      React.createElement("span", {
                        key: "1",
                        className:
                          "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                        style: { animationDelay: "0ms" },
                      }),
                      React.createElement("span", {
                        key: "2",
                        className:
                          "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                        style: { animationDelay: "150ms" },
                      }),
                      React.createElement("span", {
                        key: "3",
                        className:
                          "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                        style: { animationDelay: "300ms" },
                      }),
                    ])
                  )
                ),
              React.createElement("div", { key: "end", ref: messagesEndRef }),
            ]
          ),

          // Quick replies
          React.createElement(
            "div",
            {
              key: "quick",
              className: "p-2 bg-white border-t overflow-x-auto",
            },
            React.createElement(
              "div",
              { className: "flex gap-2 pb-2" },
              quickReplies.map((reply, index) =>
                React.createElement(
                  "button",
                  {
                    key: index,
                    onClick: () => handleQuickReply(reply),
                    className:
                      "flex-shrink-0 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors whitespace-nowrap",
                  },
                  reply
                )
              )
            )
          ),

          // Input
          React.createElement(
            "div",
            {
              key: "input",
              className: "p-4 bg-white border-t",
            },
            React.createElement("div", { className: "flex gap-2" }, [
              React.createElement("input", {
                key: "field",
                type: "text",
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyPress: (e) => e.key === "Enter" && handleSend(),
                placeholder: "Escribe tu pregunta...",
                className:
                  "flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none",
                style: { borderColor: "#d1d5db" },
                onFocus: (e) => (e.currentTarget.style.borderColor = "#059669"),
                onBlur: (e) => (e.currentTarget.style.borderColor = "#d1d5db"),
              }),
              React.createElement(
                "button",
                {
                  key: "send",
                  onClick: handleSend,
                  disabled: !inputValue.trim(),
                  className:
                    "text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                  style: {
                    width: "40px",
                    height: "40px",
                    backgroundColor: inputValue.trim() ? "#059669" : "#9ca3af",
                  },
                  onMouseEnter: (e) => {
                    if (inputValue.trim())
                      e.currentTarget.style.backgroundColor = "#047857";
                  },
                  onMouseLeave: (e) => {
                    if (inputValue.trim())
                      e.currentTarget.style.backgroundColor = "#059669";
                  },
                },
                React.createElement(
                  "svg",
                  {
                    className: "w-5 h-5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                  },
                  React.createElement("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
                  })
                )
              ),
            ])
          ),
        ]
      ),
  ]);
};

// Montar el componente
if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
  console.error("❌ React o ReactDOM no están disponibles");
} else {
  console.log("✅ Montando asistente...");
  const rootElement = document.getElementById("fitness-assistant-root");

  if (!rootElement) {
    console.error("❌ No se encontró el elemento fitness-assistant-root");
  } else {
    console.log("✅ Elemento encontrado, creando root...");
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(FitnessAssistant));
    console.log("✅ Asistente montado correctamente!");
  }
}

// Agregar estilos de animación
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse-slow {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 10px 40px rgba(5, 150, 105, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 10px 50px rgba(5, 150, 105, 0.6);
    }
  }
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);
