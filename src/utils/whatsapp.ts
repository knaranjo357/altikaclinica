export const whatsappService = {
  sendMessage: (phone: string, message: string) => {
    // Remove + and any spaces from phone number
    const cleanPhone = phone.replace(/[\+\s]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  },

  generateCitaMessage: (paciente: string, fecha: string, hora: string, actividad: string) => {
    return `Buenos días ${paciente}! 🙋🏻‍♀️ Le saluda Juliana de Altika Studio Dental, espero que se encuentre muy bien el día de hoy! 🦷☺️\n\nRecordatorio de su cita para el día ${fecha} a las ${hora} para ${actividad}.\n\nPor favor confirme su asistencia. ¡Feliz día! 🦷🙋🏻‍♀️😊`;
  },

  generateCumpleanosMessage: (paciente: string, genero: string) => {
    const greeting = genero.toLowerCase() === 'femenino' ? 'Querida' : 'Querido';
    return `¡Feliz cumpleaños ${greeting} ${paciente}! 🎉🎂\n\nDesde Altika Studio Dental queremos desearte un día lleno de alegría y sonrisas. 🦷✨\n\nComo regalo especial, te obsequiamos un descuento del 10% en tu próxima cita dental durante este mes.\n\n¡Que tengas un cumpleaños maravilloso! 🎈🦷\n\nCon cariño,\nEquipo Altika Studio Dental`;
  }
};