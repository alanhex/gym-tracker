import { Resend } from 'resend'

const APP_NAME = 'Gym Tracker'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${fromEmail}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 20px; color: #111;">Reset your password</h1>
              <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password for your ${APP_NAME} account. Click the button below to create a new password.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: #111; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
                Reset Password
              </a>
              <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                ${APP_NAME}
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}
