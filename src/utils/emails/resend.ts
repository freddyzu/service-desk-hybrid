import { Resend } from 'resend'
import { env } from '@/env'

// Si no hay API key (ej en local), no enviará nada para evitar crashes
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendTicketClosedEmail(toEmail: string, ticketId: string, titulo: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY no configurada. Correo de cierre de ticket no enviado.', { toEmail, ticketId });
    return;
  }

  // Candado digital: Enlace que llama a la API con un método seguro para reabrir
  // Nota: En producción, este enlace debería contener un token JWT o hash para evitar que cualquiera abra el ticket sabiendo el ID.
  const reopenLink = `${env.NEXT_PUBLIC_APP_URL}/api/tickets/reopen?id=${ticketId}`

  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM, // Configurable por variable de entorno (por defecto onboarding@resend.dev)
      to: [toEmail],
      subject: `Ticket Resuelto: ${titulo}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #16a34a;">Tu ticket ha sido resuelto</h2>
          <p>El equipo de servicios y conserjería ha marcado tu reporte <strong>"${titulo}"</strong> como solucionado.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>¿No se solucionó correctamente o la avería persiste?</strong></p>
          <p style="color: #666; font-size: 14px;">Utiliza el siguiente botón para activar el <em>Candado Digital</em> y reabrir el ticket automáticamente para auditoría:</p>
          <a href="${reopenLink}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 10px;">
            ⚠️ No se solucionó / Reabrir Ticket
          </a>
        </div>
      `,
    });

    if (error) {
      console.error('Error retornado por Resend:', error);
    } else {
      console.log('Correo de Candado Digital enviado con éxito:', data);
    }
  } catch (error) {
    console.error('Error enviando correo de cierre:', error);
  }
}
