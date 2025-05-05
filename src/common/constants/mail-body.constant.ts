export enum MailSubject {
  MAGIC_LINK = "Log in to Gamba App."
}

export const MailBody: { [key in MailSubject]: string } = {
  [MailSubject.MAGIC_LINK]: `
      <body style="font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center;">${MailSubject.MAGIC_LINK}</h2>
        <p>Hello {{USER_EMAIL}},</p>
        <p>You requested to log in to Gamba App. Click <a href="{{LINK}}">here</a>.</p>
        <p>This link is valid for the next 24 hours. Please use this link to log in.</p>
        <p>Best regards,</p>
      </div>
    </body>
  `
};
