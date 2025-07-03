import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { FAQ } from '../models/entities/FAQ.entity';
import 'dotenv/config';

// Helper function to create response
const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};

// GET /faq - Get all FAQs with filtering
export const getFAQs = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const category = event.queryStringParameters?.category;
        const search = event.queryStringParameters?.search;
        const page = parseInt(event.queryStringParameters?.page || '1');
        const limit = parseInt(event.queryStringParameters?.limit || '10');
        
        let query = faqRepository.createQueryBuilder('faq')
            .where('faq.is_active = :isActive', { isActive: true })
            .orderBy('faq.priority', 'ASC')
            .addOrderBy('faq.created_at', 'DESC');

        if (category && category !== 'All') {
            query = query.andWhere('faq.category = :category', { category });
        }

        if (search) {
            query = query.andWhere(
                '(faq.question ILIKE :search OR faq.answer ILIKE :search OR faq.tags ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const [faqs, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Get categories for filtering
        const categories = await faqRepository
            .createQueryBuilder('faq')
            .select('DISTINCT faq.category', 'category')
            .where('faq.is_active = :isActive', { isActive: true })
            .getRawMany();

        return createResponse(200, {
            success: true,
            data: {
                faqs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                categories: categories.map(c => c.category)
            }
        });
    } catch (error) {
        console.error('Error getting FAQs:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());

// POST /faq/query - AI-powered FAQ search
export const queryFAQ = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const body = event.body as any;
        const { question } = body;

        if (!question) {
            return createResponse(400, { success: false, error: 'Question is required' });
        }

        // Simple text search (can be enhanced with AI/ML)
        const faqs = await faqRepository
            .createQueryBuilder('faq')
            .where('faq.is_active = :isActive', { isActive: true })
            .andWhere(
                '(faq.question ILIKE :search OR faq.answer ILIKE :search OR faq.tags ILIKE :search)',
                { search: `%${question}%` }
            )
            .orderBy('faq.priority', 'ASC')
            .limit(5)
            .getMany();

        const response = {
            query: question,
            results: faqs,
            totalFound: faqs.length,
            suggestions: faqs.length === 0 ? [
                'Try using different keywords',
                'Check the spelling of your question',
                'Browse categories for related topics'
            ] : []
        };

        return createResponse(200, { success: true, data: response });
    } catch (error) {
        console.error('Error querying FAQ:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());

// GET /faq/{id} - Get single FAQ
export const getFAQById = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const faqId = event.pathParameters?.id;
        if (!faqId) {
            return createResponse(400, { success: false, error: 'FAQ ID is required' });
        }

        const faq = await faqRepository.findOne({ where: { id: faqId, is_active: true } });
        if (!faq) {
            return createResponse(404, { success: false, error: 'FAQ not found' });
        }

        // Increment view count
        await faqRepository.increment({ id: faqId }, 'view_count', 1);
        faq.view_count += 1;

        return createResponse(200, { success: true, data: faq });
    } catch (error) {
        console.error('Error getting FAQ by ID:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());

// POST /admin/faq - Create new FAQ (Admin only)
export const createFAQ = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const body = event.body as any;
        const { question, answer, category, priority, tags, is_active } = body;

        if (!question || !answer || !category) {
            return createResponse(400, { 
                success: false, 
                error: 'Question, answer, and category are required' 
            });
        }

        const faq = faqRepository.create({
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim(),
            priority: priority || 1,
            tags: tags || '',
            is_active: is_active !== undefined ? is_active : true,
            created_by: 'admin' // TODO: Get from JWT token
        });

        const savedFAQ = await faqRepository.save(faq);

        return createResponse(201, {
            success: true,
            data: savedFAQ,
            message: 'FAQ created successfully'
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());

// PUT /admin/faq/{id} - Update FAQ (Admin only)
export const updateFAQ = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const faqId = event.pathParameters?.id;
        const body = event.body as any;

        if (!faqId) {
            return createResponse(400, { success: false, error: 'FAQ ID is required' });
        }

        const faq = await faqRepository.findOne({ where: { id: faqId } });
        if (!faq) {
            return createResponse(404, { success: false, error: 'FAQ not found' });
        }

        // Update fields
        if (body.question) faq.question = body.question.trim();
        if (body.answer) faq.answer = body.answer.trim();
        if (body.category) faq.category = body.category.trim();
        if (body.priority !== undefined) faq.priority = body.priority;
        if (body.tags !== undefined) faq.tags = body.tags;
        if (body.is_active !== undefined) faq.is_active = body.is_active;

        const updatedFAQ = await faqRepository.save(faq);

        return createResponse(200, {
            success: true,
            data: updatedFAQ,
            message: 'FAQ updated successfully'
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());

// DELETE /admin/faq/{id} - Delete FAQ (Admin only)
export const deleteFAQ = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const faqRepository = dataSource.getRepository(FAQ);
        
        const faqId = event.pathParameters?.id;

        if (!faqId) {
            return createResponse(400, { success: false, error: 'FAQ ID is required' });
        }

        const result = await faqRepository.delete(faqId);
        
        if (result.affected === 0) {
            return createResponse(404, { success: false, error: 'FAQ not found' });
        }

        return createResponse(200, {
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return createResponse(500, { success: false, error: 'Internal server error' });
    }
}).use(jsonBodyParser());