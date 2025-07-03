import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { HeroSection } from '../models/entities/HeroSection.entity';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const getHeroSections = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const heroRepository = dataSource.getRepository(HeroSection);
        
        const heroSections = await heroRepository.find({
            where: { is_active: true },
            order: { display_order: 'ASC', created_at: 'DESC' }
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: heroSections
            })
        };
    } catch (error) {
        console.error('Error fetching hero sections:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch hero sections'
            })
        };
    }
}).use(jsonBodyParser());

export const createHeroSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const heroRepository = dataSource.getRepository(HeroSection);
        
        const { title, subtitle, description, background_image, cta_text, cta_link, display_order } = event.body as any;

        const heroSection = heroRepository.create({
            title,
            subtitle,
            description,
            background_image,
            cta_text,
            cta_link,
            display_order: display_order || 1,
            created_by: 'admin' // TODO: Extract from auth token
        });

        const savedHeroSection = await heroRepository.save(heroSection);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: savedHeroSection
            })
        };
    } catch (error) {
        console.error('Error creating hero section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to create hero section'
            })
        };
    }
}).use(jsonBodyParser());

export const updateHeroSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const heroRepository = dataSource.getRepository(HeroSection);
        
        const { id } = event.pathParameters!;
        const updateData = event.body as any;

        await heroRepository.update(id, updateData);
        const updatedHeroSection = await heroRepository.findOne({ where: { id } });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: updatedHeroSection
            })
        };
    } catch (error) {
        console.error('Error updating hero section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to update hero section'
            })
        };
    }
}).use(jsonBodyParser());

export const deleteHeroSection = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const heroRepository = dataSource.getRepository(HeroSection);
        
        const { id } = event.pathParameters!;
        await heroRepository.delete(id);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Hero section deleted successfully'
            })
        };
    } catch (error) {
        console.error('Error deleting hero section:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to delete hero section'
            })
        };
    }
}).use(jsonBodyParser());

