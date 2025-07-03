import { IsArray, IsString, IsOptional, IsEmail, ArrayMinSize, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export class EmailAttachmentDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  content: string | Buffer;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}

export class SendEmailRequest {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @IsEmail({}, { each: true, message: 'Each recipient must be a valid email address' })
  to: string[];

  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'HTML body is required' })
  htmlBody: string;

  @IsOptional()
  @IsString()
  textBody?: string;

  @IsOptional()
  @IsEmail({}, { message: 'From must be a valid email address' })
  from?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each reply-to must be a valid email address' })
  replyTo?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each CC must be a valid email address' })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Each BCC must be a valid email address' })
  bcc?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachment[];
}

export interface SendBulkEmailRequest {
  emails: Array<{
    to: string[];
    subject: string;
    htmlBody: string;
    textBody?: string;
    from?: string;
    replyTo?: string[];
    cc?: string[];
    bcc?: string[];
    attachments?: EmailAttachment[];
  }>;
}

export interface EmailResponse {
  messageId: string;
  status: 'success' | 'error';
  message?: string;
}

export interface BulkEmailResponse {
  results: EmailResponse[];
  totalSent: number;
  totalFailed: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: string[];
} 