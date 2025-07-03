import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { getDataSource } from '../config/database';
import { Survey } from '../models/entities/Survey.entity';
import { SurveyQuestion } from '../models/entities/SurveyQuestion.entity';
import { SurveyResponse } from '../models/entities/SurveyResponse.entity';

export const getSurveys = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const surveyRepository = dataSource.getRepository(Survey);
        
        const { includeQuestions = 'false' } = event.queryStringParameters || {};
        
        const queryBuilder = surveyRepository.createQueryBuilder('survey')
            .where('survey.is_active = :isActive', { isActive: true })
            .orderBy('survey.created_at', 'DESC');

        if (includeQuestions === 'true') {
            queryBuilder.leftJoinAndSelect('survey.questions', 'questions', 'questions.display_order')
                .addOrderBy('questions.display_order', 'ASC');
        }

        const surveys = await queryBuilder.getMany();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: surveys
            })
        };
    } catch (error) {
        console.error('Error fetching surveys:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch surveys'
            })
        };
    }
}).use(jsonBodyParser());

export const createSurvey = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const surveyRepository = dataSource.getRepository(Survey);
        const questionRepository = dataSource.getRepository(SurveyQuestion);
        
        const { title, description, target_audience, start_date, end_date, max_responses, questions } = event.body as any;

        // Create survey
        const survey = surveyRepository.create({
            title,
            description,
            target_audience,
            start_date: start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            max_responses,
            created_by: 'admin' // TODO: Extract from auth token
        });

        const savedSurvey = await surveyRepository.save(survey);

        // Create questions if provided
        if (questions && questions.length > 0) {
            const surveyQuestions = questions.map((q: any, index: number) => 
                questionRepository.create({
                    survey_id: savedSurvey.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options,
                    is_required: q.is_required || false,
                    display_order: q.display_order || index + 1
                })
            );

            await questionRepository.save(surveyQuestions);
        }

        // Return survey with questions
        const completeSurvey = await surveyRepository.findOne({
            where: { id: savedSurvey.id },
            relations: ['questions']
        });

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: completeSurvey
            })
        };
    } catch (error) {
        console.error('Error creating survey:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to create survey'
            })
        };
    }
}).use(jsonBodyParser());

export const submitSurveyResponse = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const responseRepository = dataSource.getRepository(SurveyResponse);
        
        const { id: survey_id } = event.pathParameters!;
        const { user_id, user_email, responses } = event.body as any;

        const surveyResponse = responseRepository.create({
            survey_id,
            user_id,
            user_email,
            responses
        });

        const savedResponse = await responseRepository.save(surveyResponse);

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: savedResponse
            })
        };
    } catch (error) {
        console.error('Error submitting survey response:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to submit survey response'
            })
        };
    }
}).use(jsonBodyParser());

export const getSurveyAnalytics = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const dataSource = await getDataSource();
        const surveyRepository = dataSource.getRepository(Survey);
        const responseRepository = dataSource.getRepository(SurveyResponse);
        
        const { id: survey_id } = event.pathParameters!;
        
        const survey = await surveyRepository.findOne({
            where: { id: survey_id },
            relations: ['questions']
        });

        if (!survey) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: false,
                    error: 'Survey not found'
                })
            };
        }

        const responses = await responseRepository.find({
            where: { survey_id },
            order: { submitted_at: 'DESC' }
        });

        // Calculate analytics
        const analytics = {
            survey,
            total_responses: responses.length,
            response_rate: survey.max_responses ? (responses.length / survey.max_responses * 100).toFixed(2) : null,
            responses,
            question_analytics: survey.questions.map(question => {
                const questionResponses = responses
                    .map(r => r.responses[question.id])
                    .filter(r => r !== undefined && r !== null);

                return {
                    question_id: question.id,
                    question_text: question.question_text,
                    question_type: question.question_type,
                    total_answers: questionResponses.length,
                    answers: questionResponses
                };
            })
        };

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                data: analytics
            })
        };
    } catch (error) {
        console.error('Error fetching survey analytics:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch survey analytics'
            })
        };
    }
}).use(jsonBodyParser());
