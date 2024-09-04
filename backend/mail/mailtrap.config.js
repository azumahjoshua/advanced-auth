import {MailtrapClient} from "mailtrap" ;
import dotenv from "dotenv"

dotenv.config();

const TOKEN = process.env.MAIL_TOKEN;

export const client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "Kofi Mensah",
};
// const recipients = [
//   {
//     email: "joshuaazumah6801@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);