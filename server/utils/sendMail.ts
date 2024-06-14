require('dotenv').config();
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {

    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // SMTP host (e.g., "smtp.gmail.com")
      port: parseInt(process.env.SMTP_PORT||'587'), // SMTP port (e.g., 587)
      service: process.env.SMTP_SERVICE, // Service name (e.g., "Gmail")
      auth: {
        user: process.env.SMTP_USER, // Your email username
        pass: process.env.SMTP_PASS, // Your email password or app-specific password
      },
    });

    const { email, subject, template, data } = options;

    // Render the EJS template with provided data
    const templatePath = path.join(__dirname, '../mails', template);
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.SMTP_USER, // Sender email
      to: email, // Recipient email
      subject,
      html,
    };

    // Send the email
   await transporter.sendMail(mailOptions);

 
};
 export default sendMail;