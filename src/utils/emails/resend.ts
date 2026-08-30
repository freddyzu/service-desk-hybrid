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
    await resend.emails.send({
      from: 'Service Desk <no-reply@tu-dominio.com>', // Debe configurarse un dominio verificado en Resend
      to: [toEmail],
      subject: `Ticket Resuelto: ${titulo}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: auto;">
          <h2>Tu ticket ha sido resuelto</h2>
          <p>El equipo de conserjería ha marcado tu reporte <strong>"${titulo}"</strong> como solucionado.</p>
          <hr />
          <p><strong>¿No se solucionó correctamente o la avería persiste?</strong></p>
          <p>Utiliza el siguiente botón para reabrir el ticket e informar inmediatamente a la coordinación (Auditoría de candado digital).</p>
          <a href="${reopenLink}" style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            No se solucionó / Reabrir Ticket
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error enviando correo de cierre:', error);
  }
}
