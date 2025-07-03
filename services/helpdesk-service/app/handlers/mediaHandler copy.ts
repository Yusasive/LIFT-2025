import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { MediaLibrary } from '../models/entities/MediaLibrary.entity';

export const getMediaFiles = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const mediaRepository = dataSource.getRepository(MediaLibrary);
        
        const { type, limit = '20', offset = '0' } = event.queryStringParameters || {};
        
        const query = mediaRepository.createQueryBuilder('media')
            .where('media.is_active = :isActive', { isActive: true })
            .orderBy('media.created_at', 'DESC')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        if (type) {
            query.andWhere('media.file_type LIKE :type', { type: `${type}%` });
        }

        const [files, total] = await query.getManyAndCount();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: {
                    files,
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            })
        };
    } catch (error) {
        console.error('Error fetching media files:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch media files'
            })
        };
    }
}).use(jsonBodyParser());

export const uploadMedia = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const mediaRepository = dataSource.getRepository(MediaLibrary);
        
        // Note: In a real implementation, you'd handle multipart file upload here
        // For now, we'll accept file metadata
        const { file_name, original_name, file_path, file_type, file_size, alt_text, caption, tags } = event.body as any;

        const media = mediaRepository.create({
            file_name,
            original_name,
            file_path,
            file_type,
            file_size,
            alt_text,
            caption,
            tags,
            uploaded_by: 'admin' // TODO: Extract from auth token
        });

        const savedMedia = await mediaRepository.save(media);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: savedMedia
            })
        };
    } catch (error) {
        console.error('Error uploading media:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to upload media'
            })
        };
    }
}).use(jsonBodyParser());

export const deleteMedia = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const mediaRepository = dataSource.getRepository(MediaLibrary);
        
        const { id } = event.pathParameters!;
        await mediaRepository.update(id, { is_active: false });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Media file deleted successfully'
            })
        };
    } catch (error) {
        console.error('Error deleting media:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to delete media'
            })
        };
    }
}).use(jsonBodyParser());