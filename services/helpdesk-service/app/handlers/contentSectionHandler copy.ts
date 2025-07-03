import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { ContentSection } from '../models/entities/ContentSection.entity';

export const getContentSections = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const contentRepository = dataSource.getRepository(ContentSection);
        
        const { page_location } = event.queryStringParameters || {};
        
        const queryBuilder = contentRepository.createQueryBuilder('content')
            .where('content.is_active = :isActive', { isActive: true })
            .orderBy('content.display_order', 'ASC')
            .addOrderBy('content.created_at', 'DESC');

        if (page_location) {
            queryBuilder.andWhere('content.page_location = :pageLocation', { pageLocation: page_location });
        }

        const contentSections = await queryBuilder.getMany();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: contentSections
            })
        };
    } catch (error) {
        console.error('Error fetching content sections:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch content sections'
            })
        };
    }
}).use(jsonBodyParser());

export const createContentSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const contentRepository = dataSource.getRepository(ContentSection);
        
        const { section_name, section_type, title, content, media_urls, settings, page_location, display_order } = event.body as any;

        const contentSection = contentRepository.create({
            section_name,
            section_type,
            title,
            content,
            media_urls,
            settings,
            page_location,
            display_order: display_order || 1,
            created_by: 'admin' // TODO: Extract from auth token
        });

        const savedContentSection = await contentRepository.save(contentSection);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: savedContentSection
            })
        };
    } catch (error) {
        console.error('Error creating content section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to create content section'
            })
        };
    }
}).use(jsonBodyParser());

export const updateContentSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const contentRepository = dataSource.getRepository(ContentSection);
        
        const { id } = event.pathParameters!;
        const updateData = event.body as any;

        await contentRepository.update(id, updateData);
        const updatedContentSection = await contentRepository.findOne({ where: { id } });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: updatedContentSection
            })
        };
    } catch (error) {
        console.error('Error updating content section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to update content section'
            })
        };
    }
}).use(jsonBodyParser());

export const deleteContentSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const contentRepository = dataSource.getRepository(ContentSection);
        
        const { id } = event.pathParameters!;
        await contentRepository.update(id, { is_active: false });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Content section deleted successfully'
            })
        };
    } catch (error) {
        console.error('Error deleting content section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to delete content section'
            })
        };
    }
}).use(jsonBodyParser());