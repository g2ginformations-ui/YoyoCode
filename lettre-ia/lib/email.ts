import nodemailer from "nodemailer";

// Envoi des e-mails (liens de connexion), au choix :
// - Gmail : GMAIL_USER + GMAIL_APP_PASSWORD (mot de passe d'application Google), gratuit, sans nom de domaine ;
// - Resend : RESEND_API_KEY + EMAIL_FROM, sur un domaine vérifié dans Resend.
function gmailEnabled(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function resendEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function emailEnabled(): boolean {
  return gmailEnabled() || resendEnabled();
}

export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  if (gmailEnabled()) {
    const user = process.env.GMAIL_USER!.trim();
    const transport = nodemailer.createTransport({
      service: "gmail",
      // Google affiche le mot de passe d'application par groupes de 4 lettres : les espaces sont retirés.
      auth: { user, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
    });
    await transport.sendMail({ from: `MaMotiv <${user}>`, to, subject, html, text });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Envoi de l'e-mail impossible (${res.status}) : ${await res.text()}`);
}
