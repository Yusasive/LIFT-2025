import { APIGatewayProxyEventV2 } from "aws-lambda";
import { EmailService } from "../services/EmailService";
import { autoInjectable, inject } from 'tsyringe';


@autoInjectable()
export class EmailController {
  constructor(
    @inject("EmailService") private emailService: EmailService
  ) {}
  
  async handleEmail(event: APIGatewayProxyEventV2) {
    const httpMethod = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    switch(true) {
        case httpMethod === 'POST' && path === '/email/send':
            return await this.emailService.sendEmail(event);
        // case httpMethod === 'POST' && path === '/email/send-bulk':
        //     return await this.emailService.sendBulkEmails(event);
        case httpMethod === 'GET' && path === '/email/statistics':
            return await this.emailService.getSendingStatistics(event);
        // case httpMethod === 'POST' && path === '/email/verify':
        //     return await this.emailService.verifyEmailAddress(event);
        default:
            return await this.emailService.ResponseWithError(event);
    }
  }
}









// import { injectable, inject } from 'tsyringe';
// import { EmailService } from '../services/EmailService';
// import { SendEmailRequest, SendBulkEmailRequest } from '../types/email.type';
// import { EmailServiceError } from '../utility/errors';

// @injectable()
// export class EmailController {
//   constructor(
//     @inject(EmailService)
//     private emailService: EmailService
//   ) {}

//   /**
//    * Send a single email
//    */
//   async sendEmail(request: SendEmailRequest) {
//     try {
//       // If attachments are present, use the attachment method
//       if (request.attachments && request.attachments.length > 0) {
//         return await this.emailService.sendEmailWithAttachments(request);
//       }
      
//       return await this.emailService.sendEmail(request);
//     } catch (error) {
//       if (error instanceof EmailServiceError) {
//         throw error;
//       }
//       throw new EmailServiceError(`Failed to send email: ${error.message}`);
//     }
//   }

//   /**
//    * Send bulk emails
//    */
//   async sendBulkEmails(request: SendBulkEmailRequest) {
//     try {
//       return await this.emailService.sendBulkEmails(request);
//     } catch (error) {
//       if (error instanceof EmailServiceError) {
//         throw error;
//       }
//       throw new EmailServiceError(`Failed to send bulk emails: ${error.message}`);
//     }
//   }

//   /**
//    * Get SES sending statistics
//    */
//   async getSendingStatistics() {
//     try {
//       return await this.emailService.getSendingStatistics();
//     } catch (error) {
//       if (error instanceof EmailServiceError) {
//         throw error;
//       }
//       throw new EmailServiceError(`Failed to get sending statistics: ${error.message}`);
//     }
//   }

//   /**
//    * Verify email address
//    */
//   async verifyEmailAddress(emailAddress: string) {
//     try {
//       await this.emailService.verifyEmailAddress(emailAddress);
//       return { message: 'Email verification request sent successfully' };
//     } catch (error) {
//       if (error instanceof EmailServiceError) {
//         throw error;
//       }
//       throw new EmailServiceError(`Failed to verify email address: ${error.message}`);
//     }
//   }
// } 