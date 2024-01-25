import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport/index.js';

import { ServerError } from '@/errors/errors.js';

export async function sendEmail(options: MailOptions) {
  try {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT!),
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    // 2) Define the email options
    const mailOptions: MailOptions = {
      from: 'Tom Smith <from@example.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } catch (e) {
    throw new ServerError(
      'There was an error sending the email. Try again later!',
    );
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetPasswordToken: string,
) {
  const resetUrl = `${process.env.API_URL}/users/reset-password/${resetPasswordToken}`;

  await sendEmail({
    to: email,
    subject: `Reset your password for ${process.env.APP_NAME}, ${name}`,
    html: `<div><p>We received a request to reset the password for your account.</p>
              <p>If you made this request, click the link below. If not, you can ignore this email.</p>
              <p>Please click on the following link to reset your password: </p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>(Link not working? Try pasting it into your browser!)</p>
        </div>`,
  });
}
