// type EmailParams = {
//   to: string
//   subject: string
//   text: string
//   html?: string
// }

// export async function sendEmail({ to, subject, text, html }: EmailParams) {
//   // For development, just log the email
//   if (process.env.NODE_ENV === "development") {
//     console.log("Email sent:", { to, subject, text, html })
//     return
//   }

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
// }

// Updated to use Nodemailer
import nodemailer from "nodemailer"

type EmailParams = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailParams) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  // For development, log the email and also try to send it if credentials are provided
  if (process.env.NODE_ENV === "development") {
    console.log("Email details:", { to, subject, text, html })

    // Only attempt to send if credentials are provided
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.log("Email not sent: No email credentials provided")
      return
    }
  }

  try {
    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}


