import React, { useState, useRef, useEffect } from 'react';

const FitnessAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      text: '¡Hola! 👋 Soy tu asistente virtual de fitness. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Base de conocimientos del asistente
  const knowledgeBase = {
    saludos: {
      keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi'],
      responses: [
        '¡Hola! 😊 ¿En qué puedo ayudarte con tu entrenamiento hoy?',
        '¡Buen día! 💪 ¿Tienes alguna pregunta sobre fitness o nutrición?',
        '¡Hola! Estoy aquí para ayudarte con tus objetivos fitness. ¿Qué necesitas?'
      ]
    },
    proteina: {
      keywords: ['proteina', 'protein', 'suplemento', 'batido', 'whey'],
      responses: [
        'Para aumentar masa muscular, se recomienda consumir 1.6-2.2g de proteína por kg de peso corporal. Nuestros suplementos de proteína son 100% naturales y perfectos para post-entrenamiento. ¿Quieres ver nuestro catálogo?',
        'La proteína es esencial para la recuperación muscular. Tenemos proteína vegana, whey y caseína. ¿Cuál te interesa más?'
      ]
    },
    bajar_peso: {
      keywords: ['bajar de peso', 'adelgazar', 'perder peso', 'quemar grasa', 'definir'],
      responses: [
        'Para perder peso de forma saludable:\n\n1. Déficit calórico moderado (300-500 cal)\n2. Entrenamiento de fuerza 3-4 veces/semana\n3. Cardio 2-3 veces/semana\n4. Dormir 7-8 horas\n5. Mantener proteína alta (1.8g/kg)\n\n¿Necesitas equipos para entrenar en casa?',
        'La clave está en combinar dieta equilibrada con ejercicio. Te recomiendo:\n- Caminadora o bicicleta para cardio\n- Pesas para mantener músculo\n- Proteína para saciedad\n\n¿Te muestro productos recomendados?'
      ]
    },
    aumentar_masa: {
      keywords: ['aumentar masa', 'ganar musculo', 'hipertrofia', 'volumen', 'crecer'],
      responses: [
        'Para ganar masa muscular:\n\n1. Superávit calórico (+300-500 cal)\n2. Proteína: 2g por kg de peso\n3. Entrenamiento progresivo con pesas\n4. Descanso adecuado\n5. Suplementación: Proteína, creatina\n\n¿Quieres ver nuestros equipos de gimnasio?',
        'El entrenamiento con pesas es fundamental. Te recomiendo:\n- Set de mancuernas ajustables\n- Barra olímpica con discos\n- Banco ajustable\n- Suplementos: Proteína y Creatina\n\n¿Te interesa alguno?'
      ]
    },
    entrenamiento: {
      keywords: ['entrenar', 'rutina', 'ejercicio', 'workout', 'gimnasio'],
      responses: [
        'Tipos de entrenamiento según objetivos:\n\n💪 Fuerza: 3-5 reps, descansos largos\n🏋️ Hipertrofia: 8-12 reps, descansos medios\n🔥 Definición: 12-15 reps, descansos cortos\n🏃 Cardio: HIIT o steady state\n\n¿Qué objetivo tienes?',
        'Para principiantes recomiendo:\n- Full body 3x/semana\n- Ejercicios básicos (sentadillas, press, remo)\n- Progresión gradual\n\n¿Necesitas equipamiento?'
      ]
    },
    nutricion: {
      keywords: ['nutricion', 'dieta', 'alimentacion', 'comer', 'comida'],
      responses: [
        'Macros básicos:\n\n🥩 Proteínas: Construcción muscular\n🍚 Carbohidratos: Energía\n🥑 Grasas: Hormonas y salud\n\nDistribución típica:\n- Mantenimiento: 30% P / 40% C / 30% G\n- Definición: 40% P / 30% C / 30% G\n- Volumen: 25% P / 50% C / 25% G\n\n¿Necesitas suplementos nutricionales?',
        'Una dieta balanceada es clave. Recomiendo:\n- 4-5 comidas al día\n- Proteína en cada comida\n- Carbos antes/después del entreno\n- Hidratación constante\n\nTenemos suplementos naturales si te interesan.'
      ]
    },
    creatina: {
      keywords: ['creatina', 'creatine', 'suplemento creatina'],
      responses: [
        'La creatina es uno de los suplementos más estudiados:\n\n✅ Aumenta fuerza y potencia\n✅ Mejora recuperación\n✅ Segura y efectiva\n\nDosis: 5g diarios, cualquier hora\nNo necesita fase de carga\n\nTenemos creatina monohidrato pura. ¿Te interesa?'
      ]
    },
    equipos: {
      keywords: ['equipo', 'maquina', 'pesas', 'mancuernas', 'barra', 'banco'],
      responses: [
        'Tenemos equipos para todos los niveles:\n\n🏠 Home gym:\n- Mancuernas ajustables\n- Banco multiposición\n- Bandas de resistencia\n\n🏋️ Profesional:\n- Power rack\n- Barra olímpica\n- Set de discos\n\n¿Qué tipo de equipo buscas?'
      ]
    },
    cardio: {
      keywords: ['cardio', 'correr', 'caminadora', 'bicicleta', 'eliptica'],
      responses: [
        'Equipos de cardio disponibles:\n\n🏃 Caminadora: Ideal para correr/caminar\n🚴 Bicicleta estática: Bajo impacto\n🎯 Elíptica: Trabajo completo, bajo impacto\n\nTodos incluyen monitor de frecuencia cardíaca.\n\n¿Cuál prefieres?'
      ]
    },
    precio: {
      keywords: ['precio', 'costo', 'cuanto cuesta', 'valor', '$'],
      responses: [
        'Nuestros precios son muy competitivos:\n\n💊 Suplementos: desde $25\n🏋️ Equipos básicos: desde $30\n🏃 Máquinas cardio: desde $400\n🎯 Accesorios: desde $10\n\n¡Envío gratis en compras +$50!\n\n¿Qué producto te interesa?'
      ]
    },
    envio: {
      keywords: ['envio', 'entrega', 'delivery', 'cuanto tarda'],
      responses: [
        '📦 Información de envíos:\n\n✅ Envío gratis en compras +$50\n✅ Entrega: 3-7 días hábiles\n✅ Equipos grandes: 10-15 días\n✅ Tracking incluido\n\n¿Tienes tu dirección lista para ordenar?'
      ]
    },
    principiante: {
      keywords: ['principiante', 'empezar', 'comenzar', 'inicio', 'nuevo'],
      responses: [
        'Para principiantes recomiendo:\n\n📋 Plan de entrenamiento:\n1. Full body 3x/semana\n2. Ejercicios básicos\n3. 30-45 min por sesión\n\n🛒 Equipo esencial:\n- Par de mancuernas\n- Colchoneta\n- Banda de resistencia\n\n💊 Suplementos:\n- Multivitamínico\n- Proteína (opcional)\n\n¿Por dónde quieres empezar?'
      ]
    },
    horario: {
      keywords: ['cuando entrenar', 'horario', 'mejor hora', 'mañana o tarde'],
      responses: [
        'El mejor horario es el que puedas mantener consistente:\n\n🌅 Mañana:\n+ Mayor disciplina\n+ Metabolismo activo\n- Cuerpo frío\n\n🌆 Tarde:\n+ Fuerza máxima\n+ Cuerpo caliente\n- Más cansancio\n\nLo importante es la constancia. ¿Cuál horario prefieres?'
      ]
    }
  };

  const quickReplies = [
    '¿Cómo bajar de peso?',
    '¿Cómo ganar músculo?',
    'Rutinas de entrenamiento',
    'Suplementos recomendados',
    'Equipos para casa',
    'Nutrición fitness'
  ];

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Buscar coincidencia en la base de conocimientos
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // Respuesta por defecto
    return 'Interesante pregunta. Puedo ayudarte con:\n\n💪 Entrenamiento y rutinas\n🥗 Nutrición y dieta\n💊 Suplementos\n🏋️ Equipos de gimnasio\n🎯 Consejos fitness\n\n¿Sobre qué tema específico quieres saber?';
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular tiempo de respuesta
    setTimeout(() => {
      const response = getResponse(inputValue);
      const assistantMessage = {
        type: 'assistant',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickReply = (reply) => {
    setInputValue(reply);
    setTimeout(() => handleSend(), 100);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
        style={{ width: '60px', height: '60px' }}
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                💪
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Asistente Fitness</h3>
                <p className="text-xs opacity-90">Siempre disponible para ayudarte</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className={`text-xs mt-1 block ${
                    message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="p-2 bg-white border-t overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ width: '40px', height: '40px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FitnessAssistant;
