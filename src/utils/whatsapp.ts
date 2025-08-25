export const whatsappService = {
  /**
   * Abre WhatsApp con un mensaje. Limpia el número y sanea el texto para
   * evitar emojis “complejos” (tonos de piel, género, ZWJ) que a veces
   * WhatsApp o algunos dispositivos no renderizan y salen como �.
   */
  sendMessage: (phone: string, message: string) => {
    // 1) Dejar solo dígitos (quita +, espacios, paréntesis, guiones, etc.)
    const cleanPhone = phone.replace(/[^\d]/g, '');

    // 2) Saneamos el mensaje para compatibilidad amplia de emojis
    const safeMessage = sanitizeForWhatsApp(message);

    // 3) Codificamos el mensaje
    const encoded = encodeURIComponent(safeMessage);

    // 4) URL de WhatsApp (api.whatsapp.com suele ser más compatible)
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;

    // 5) Intentamos abrir en nueva pestaña; si el navegador lo bloquea, navegamos en la misma
    const w = window.open(url, '_blank');
    if (!w || w.closed || typeof w.closed === 'undefined') {
      window.location.href = url;
    }
  },

  /**
   * Mensaje de recordatorio de cita con emojis “básicos” y sanos.
   * Evitamos tonos de piel y secuencias con ZWJ.
   */
  generateCitaMessage: (paciente: string, fecha: string, hora: string, actividad: string) => {
    const raw = [
      `¡Hola ${paciente}! 👋 Soy Juliana de Altika Studio Dental.`,
      `Recordatorio de su cita para el ${fecha} a las ${hora} (${actividad}).`,
      `Por favor confirme su asistencia. ¡Feliz día! 🙂`
    ].join('\n\n');

    return sanitizeForWhatsApp(raw);
  },

  /**
   * Mensaje de cumpleaños con emojis seguros.
   */
  generateCumpleanosMessage: (paciente: string, genero: string) => {
    const saludo = genero?.toLowerCase() === 'femenino' ? 'Querida' : 'Querido';

    const raw = [
      `¡Feliz cumpleaños, ${saludo} ${paciente}! 🎉🎂`,
      `En Altika Studio Dental te deseamos un día lleno de sonrisas. 🙂`,
      `Te obsequiamos un 10% de descuento en tu próxima cita durante este mes.`,
      `Con cariño,\nEquipo Altika Studio Dental`
    ].join('\n\n');

    return sanitizeForWhatsApp(raw);
  }
};

/**
 * Sanea texto para WhatsApp:
 * - Elimina ZWJ (U+200D) y Variation Selector-16 (U+FE0F)
 * - Elimina modificadores de tono de piel (U+1F3FB–U+1F3FF)
 * - Elimina signos de género (U+2640, U+2642)
 * - Normaliza a NFKC
 * - Reemplaza algunas secuencias “jóvenes” por equivalentes básicos
 */
function sanitizeForWhatsApp(input: string): string {
  let s = input
    .normalize('NFKC')
    // Quita Zero Width Joiner y variation selector
    .replace(/[\u200D\uFE0F]/g, '')
    // Quita modificadores de tono de piel (requiere flag 'u')
    .replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')
    // Quita signos de género (♀ ♂) que forman compuestos con ZWJ
    .replace(/[\u2640\u2642]/g, '');

  // Reemplazos hacia emojis básicos y muy soportados
  s = s
    // Saludos con mano -> usa 👋
    .replace(/🙋/g, '👋')
    // Caritas con variación -> usa 🙂 (muy soportado)
    .replace(/☺/g, '🙂');

  // Opcional: si necesitas máxima compatibilidad, descomenta para
  // sustituir el diente por una carita (algunos equipos MUY antiguos no tienen 🦷)
  // s = s.replace(/🦷/g, '🙂');

  return s;
}
