import { client,sender } from "./mailtrap.config.js";
import {VERIFICATION_EMAIL_TEMPLATE} from "./emailTemplates.js"
export const sendVerificationEmail = async(email,verificationToken)=>{
    const recipients = [{email}]
    try {
        const response = await client.send({
            from:sender,
            to:recipients,
            subject:"Verfiy your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category:"Email Verfication"
        })
        console.log("Email Sent successfully",response)
    } catch (error) {
        console.log(`Error sending verification email`, error)
        throw new Error(`Error sending verfication email: ${error.message}`)
    }
}
export const sendWelcomeEmail = async(email,name)=>{
    const recipients = [{email}]
    try {
        const response = await client.send({
            from:sender,
            to: recipients,
            template_uuid:"a7f7cd85-327c-43fc-ac4f-2766326e13cd",
            template_variables:{
                company_info_name:"Auth Company",
                name:name,
            }
        })
        console.log("Welcome email sent successfully",response)
    } catch (error) {
        console.log(`Error sending welcome email`, error)
        throw new Error(`Error sending welcome email: ${error.message}`)
    }

}