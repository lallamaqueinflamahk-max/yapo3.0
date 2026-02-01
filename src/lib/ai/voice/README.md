# Voz: captura, procesamiento, salida

Arquitectura separada para:

1. **Captura** → transcripción (Web Speech API hoy; OpenAI Whisper luego).
2. **Procesamiento** → motor del Cerebro (analyzeQuery).
3. **Salida** → reproducción de voz (Web Speech Synthesis hoy; ElevenLabs luego).

## Captura (IVoiceCapture)

- **Actual:** `createWebSpeechCapture()` — Web Speech API (SpeechRecognition), transcripción en el navegador.
- **Futuro Whisper:** Implementar `IVoiceCapture` con `start()`/`stop()`/`onTranscript()`; opcionalmente `getAudioBlob()` para enviar audio a la API de Whisper y devolver transcripción vía callback.

## Salida (IVoiceOutput)

- **Actual:** `createWebSpeechOutput()` — Web Speech API (SpeechSynthesis), voz sintética básica.
- **Futuro ElevenLabs:** Implementar `IVoiceOutput` con `speak(text, options)` usando `voiceId` y `tone`; opcionalmente `getVoices()` para listar voces de la API. Respetar elegibilidad (solo premium, pymes, enterprises, Mbareté +500 referidos) vía `canUseVoice()` en `eligibility.ts`.

## Uso en el Cerebro

1. **Captura:** `VoiceButton` usa `createVoiceCapture()`; al recibir transcripción final llama `onTranscript(text)`.
2. **Procesamiento:** CerebroSearch recibe el texto y llama `analyzeQuery(text)` (motor).
3. **Salida:** Se muestra la respuesta en texto y se ofrece "Escuchar respuesta" con `createVoiceOutput().speak(result.message)`. Si la consulta fue por voz, se reproduce automáticamente.

No se integran APIs externas (Whisper, ElevenLabs) aún; solo interfaces y implementaciones Web Speech.
