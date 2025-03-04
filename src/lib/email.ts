type EmailParams = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailParams) {
  // For development, just log the email
  if (process.env.NODE_ENV === "development") {
    console.log("Email sent:", { to, subject, text, html })
    return
  }

  // In production, use your email service
  // Example with SendGrid:
  // const msg = {
  //   to,
  //   from: process.env.EMAIL_FROM,
  //   subject,
  //   text,
  //   html: html || text,
  // };
  // await sgMail.send(msg);
}

