import AWS from 'aws-sdk';
import { injectable } from 'tsyringe';
import { 
  SendEmailRequest, 
  SendBulkEmailRequest, 
  EmailResponse, 
  BulkEmailResponse,
  EmailAttachment 
} from '../types/email.type';
import { SESError, AttachmentError } from '../utility/errors';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ErrorResponse } from '../utility/response';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AppValidationError } from '../utility/errors';

@injectable()
export class EmailService {
  private ses: AWS.SES;

  constructor() {
    this.ses = new AWS.SES({
      region: process.env.AWS_SES_REGION || 'eu-north-1',
      apiVersion: '2010-12-01'
    });
  }

  async ResponseWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(404, "requested method is not supported!");
  }

  /**
   * Send a single email with HTML content, multiple recipients, and optional attachments
   */
  async sendEmail(event: APIGatewayProxyEventV2): Promise<EmailResponse> {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(SendEmailRequest, body);
      const validationError = await validate(input);

      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Check if we have attachments
      if (input.attachments && input.attachments.length > 0) {
        return await this.sendEmailWithAttachments(input);
      }

      const params: AWS.SES.SendEmailRequest = {
        Source: input.from || process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        Destination: {
          ToAddresses: input.to,
          CcAddresses: input.cc || [],
          BccAddresses: input.bcc || []
        },
        Message: {
          Subject: {
            Data: input.subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: input.htmlBody,
              Charset: 'UTF-8'
            },
            ...(input.textBody && {
              Text: {
                Data: input.textBody,
                Charset: 'UTF-8'
              }
            })
          }
        },
        ...(input.replyTo && input.replyTo.length > 0 && {
          ReplyToAddresses: input.replyTo
        })
      };

      const result = await this.ses.sendEmail(params).promise();
      
      return {
        messageId: result.MessageId!,
        status: 'success'
      };
    } catch (error: any) {
      throw new SESError(`Failed to send email: ${error.message}`, error);
    }
  }

  /**
   * Send email with attachments using SendRawEmail
   */
  async sendEmailWithAttachments(request: SendEmailRequest): Promise<EmailResponse> {
    try {
      this.validateEmailRequest(request);
      this.validateAttachments(request.attachments);

      const boundary = `boundary_${Date.now()}`;
      const rawMessage = this.buildRawEmailMessage(request, boundary);

      const params: AWS.SES.SendRawEmailRequest = {
        RawMessage: {
          Data: rawMessage
        }
      };

      const result = await this.ses.sendRawEmail(params).promise();

      return {
        messageId: result.MessageId!,
        status: 'success'
      };
    } catch (error: any) {
      throw new SESError(`Failed to send email with attachments: ${error.message}`, error);
    }
  }

  /**
   * Send multiple emails in bulk
   */
  // async sendBulkEmails(request: SendBulkEmailRequest): Promise<BulkEmailResponse> {
  //   const results: EmailResponse[] = [];
  //   let totalSent = 0;
  //   let totalFailed = 0;

  //   for (const emailRequest of request.emails) {
  //     try {
  //       const result = await this.sendEmail(emailRequest);
  //       results.push(result);
  //       totalSent++;
  //     } catch (error: any) {
  //       results.push({
  //         messageId: '',
  //         status: 'error',
  //         message: error.message
  //       });
  //       totalFailed++;
  //     }
  //   }

  //   return {
  //     results,
  //     totalSent,
  //     totalFailed
  //   };
  // }

  /**
   * Validate email request parameters
   */
  private validateEmailRequest(request: SendEmailRequest): void {
    if (!request.to || request.to.length === 0) {
      throw new AppValidationError([{
        property: 'to',
        constraints: {
          isNotEmpty: 'At least one recipient email is required'
        }
      }]);
    }

    if (!request.subject || request.subject.trim() === '') {
      throw new AppValidationError([{
        property: 'subject',
        constraints: {
          isNotEmpty: 'Email subject is required'
        }
      }]);
    }

    if (!request.htmlBody || request.htmlBody.trim() === '') {
      throw new AppValidationError([{
        property: 'htmlBody',
        constraints: {
          isNotEmpty: 'HTML body is required'
        }
      }]);
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of request.to) {
      if (!emailRegex.test(email)) {
        throw new AppValidationError([{
          property: 'to',
          constraints: {
            isEmail: `Invalid email address: ${email}`
          }
        }]);
      }
    }

    if (request.cc) {
      for (const email of request.cc) {
        if (!emailRegex.test(email)) {
          throw new AppValidationError([{
            property: 'cc',
            constraints: {
              isEmail: `Invalid CC email address: ${email}`
            }
          }]);
        }
      }
    }

    if (request.bcc) {
      for (const email of request.bcc) {
        if (!emailRegex.test(email)) {
          throw new AppValidationError([{
            property: 'bcc',
            constraints: {
              isEmail: `Invalid BCC email address: ${email}`
            }
          }]);
        }
      }
    }
  }

  /**
   * Validate attachments
   */
  private validateAttachments(attachments?: EmailAttachment[]): void {
    if (!attachments || attachments.length === 0) {
      return;
    }

    for (const attachment of attachments) {
      if (!attachment.filename || attachment.filename.trim() === '') {
        throw new AttachmentError('Attachment filename is required');
      }

      if (!attachment.content) {
        throw new AttachmentError('Attachment content is required');
      }

      if (!attachment.contentType || attachment.contentType.trim() === '') {
        throw new AttachmentError('Attachment content type is required');
      }
    }
  }

  /**
   * Build raw email message with attachments
   */
  private buildRawEmailMessage(request: SendEmailRequest, boundary: string): Buffer {
    const from = request.from || process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    const to = request.to.join(', ');
    const cc = request.cc && request.cc.length > 0 ? request.cc.join(', ') : '';
    const bcc = request.bcc && request.bcc.length > 0 ? request.bcc.join(', ') : '';
    const replyTo = request.replyTo && request.replyTo.length > 0 ? request.replyTo.join(', ') : '';

    let message = '';
    
    // Headers
    message += `From: ${from}\r\n`;
    message += `To: ${to}\r\n`;
    if (cc) message += `Cc: ${cc}\r\n`;
    if (bcc) message += `Bcc: ${bcc}\r\n`;
    if (replyTo) message += `Reply-To: ${replyTo}\r\n`;
    message += `Subject: ${request.subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    // HTML body
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/html; charset=UTF-8\r\n`;
    message += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
    message += `${request.htmlBody}\r\n\r\n`;

    // Text body (if provided)
    if (request.textBody) {
      message += `--${boundary}\r\n`;
      message += `Content-Type: text/plain; charset=UTF-8\r\n`;
      message += `Content-Transfer-Encoding: 7bit\r\n\r\n`;
      message += `${request.textBody}\r\n\r\n`;
    }

    // Attachments
    if (request.attachments && request.attachments.length > 0) {
      for (const attachment of request.attachments) {
        message += `--${boundary}\r\n`;
        message += `Content-Type: ${attachment.contentType}; name="${attachment.filename}"\r\n`;
        message += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
        message += `Content-Transfer-Encoding: base64\r\n\r\n`;
        
        const content = typeof attachment.content === 'string' 
          ? attachment.content 
          : attachment.content.toString('base64');
        message += `${content}\r\n\r\n`;
      }
    }

    message += `--${boundary}--\r\n`;

    return Buffer.from(message, 'utf8');
  }

  /**
   * Get SES sending statistics
   */
  async getSendingStatistics(event: APIGatewayProxyEventV2): Promise<AWS.SES.GetSendStatisticsResponse> {
    try {
      return await this.ses.getSendStatistics().promise();
    } catch (error: any) {
      throw new SESError(`Failed to get sending statistics: ${error.message}`, error);
    }
  }

  /**
   * Verify email address with SES
   */
  // async verifyEmailAddress(emailAddress: string): Promise<void> {
  //   try {
  //     await this.ses.verifyEmailIdentity({ EmailAddress: emailAddress }).promise();
  //   } catch (error: any) {
  //     throw new SESError(`Failed to verify email address: ${error.message}`, error);
  //   }
  // }
} 