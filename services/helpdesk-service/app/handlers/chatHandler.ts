// File: services/helpdesk-service/app/handlers/chatHandler.ts
// Enhanced Chat Handler with missing functions
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { ChatSession } from '../models/entities/ChatSession.entity';
import { ChatMessage } from '../models/entities/ChatMessage.entity';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const getChatSessions = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const sessionRepository = dataSource.getRepository(ChatSession);
        
        const { status, priority, limit = '50', offset = '0' } = event.queryStringParameters || {};
        
        const queryBuilder = sessionRepository.createQueryBuilder('session')
            .leftJoinAndSelect('session.messages', 'messages')
            .orderBy('session.updated_at', 'DESC')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        if (status) {
            queryBuilder.andWhere('session.status = :status', { status });
        }
        
        if (priority) {
            queryBuilder.andWhere('session.priority = :priority', { priority });
        }

        const sessions = await queryBuilder.getMany();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: sessions
            })
        };
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch chat sessions'
            })
        };
    }
}).use(jsonBodyParser());

export const getChatMessages = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const messageRepository = dataSource.getRepository(ChatMessage);
        
        const { id: sessionId } = event.pathParameters!;
        
        const messages = await messageRepository.find({
            where: { session_id: sessionId },
            order: { created_at: 'ASC' }
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: messages
            })
        };
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch chat messages'
            })
        };
    }
}).use(jsonBodyParser());

export const updateChatSession = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const sessionRepository = dataSource.getRepository(ChatSession);
        
        const { id } = event.pathParameters!;
        const updateData = event.body as any;

        await sessionRepository.update(id, updateData);
        const updatedSession = await sessionRepository.findOne({ where: { id } });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: updatedSession
            })
        };
    } catch (error) {
        console.error('Error updating chat session:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to update chat session'
            })
        };
    }
}).use(jsonBodyParser());

// File: services/helpdesk-service/app/handlers/siteSettingsHandler.ts
// Site Settings Management
import { SiteSetting } from '../models/entities/SiteSetting.entity';

export const getSiteSettings = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const settingsRepository = dataSource.getRepository(SiteSetting);
        
        const { category } = event.queryStringParameters || {};
        
        const queryBuilder = settingsRepository.createQueryBuilder('setting');
        
        if (category) {
            queryBuilder.where('setting.category = :category', { category });
        }
        
        const settings = await queryBuilder.getMany();

        // Convert to key-value pairs
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.setting_key] = {
                value: setting.setting_value,
                type: setting.setting_type,
                description: setting.description,
                category: setting.category
            };
            return acc;
        }, {} as any);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: settingsMap
            })
        };
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch site settings'
            })
        };
    }
}).use(jsonBodyParser());

export const updateSiteSettings = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const settingsRepository = dataSource.getRepository(SiteSetting);
        
        const settings = event.body as Record<string, any>;
        
        for (const [key, value] of Object.entries(settings)) {
            await settingsRepository
                .createQueryBuilder()
                .update(SiteSetting)
                .set({ 
                    setting_value: String(value),
                    updated_by: 'admin' // TODO: Get from auth
                })
                .where('setting_key = :key', { key })
                .execute();
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Settings updated successfully'
            })
        };
    } catch (error) {
        console.error('Error updating site settings:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to update site settings'
            })
        };
    }
}).use(jsonBodyParser());