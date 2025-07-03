// ================================================
// Testing & Integration Setup for Complete CMS
// ================================================

// File: services/helpdesk-service/scripts/test-api.ts
// API Testing Script
import axios from 'axios';

interface TestResult {
    endpoint: string;
    method: string;
    status: 'PASS' | 'FAIL';
    responseTime: number;
    error?: string;
}

class APITester {
    private baseUrl: string;
    private results: TestResult[] = [];

    constructor(baseUrl: string = 'http://localhost:4003') {
        this.baseUrl = baseUrl;
    }

    async runAllTests(): Promise<TestResult[]> {
        console.log('🚀 Starting API Tests...\n');

        const tests = [
            // Hero Section Tests
            { method: 'GET', endpoint: '/hero-sections', name: 'Get Hero Sections' },
            { method: 'POST', endpoint: '/admin/hero-sections', name: 'Create Hero Section', data: {
                title: 'Test Hero',
                subtitle: 'Test Subtitle',
                description: 'Test Description',
                display_order: 1
            }},

            // Media Tests
            { method: 'GET', endpoint: '/media', name: 'Get Media Files' },
            { method: 'POST', endpoint: '/admin/media/upload', name: 'Upload Media', data: {
                file_name: 'test.jpg',
                original_name: 'test.jpg',
                file_path: '/uploads/test.jpg',
                file_type: 'image/jpeg',
                file_size: 1024
            }},

            // Survey Tests
            { method: 'GET', endpoint: '/surveys', name: 'Get Surveys' },
            { method: 'POST', endpoint: '/admin/surveys', name: 'Create Survey', data: {
                title: 'Test Survey',
                description: 'Test Description',
                target_audience: 'all',
                questions: [{
                    question_text: 'How satisfied are you?',
                    question_type: 'rating',
                    is_required: true,
                    display_order: 1,
                    options: { scale: 5 }
                }]
            }},

            // Content Section Tests
            { method: 'GET', endpoint: '/content-sections', name: 'Get Content Sections' },
            { method: 'POST', endpoint: '/admin/content-sections', name: 'Create Content Section', data: {
                section_name: 'Test Section',
                section_type: 'text',
                title: 'Test Title',
                content: 'Test content',
                page_location: 'homepage',
                display_order: 1
            }},

            // FAQ Tests
            { method: 'GET', endpoint: '/faq', name: 'Get FAQs' },
            { method: 'POST', endpoint: '/admin/faq', name: 'Create FAQ', data: {
                question: 'Test Question?',
                answer: 'Test Answer',
                category: 'General',
                priority: 1
            }},

            // Chat Tests
            { method: 'POST', endpoint: '/chat/init', name: 'Initialize Chat', data: {
                userId: 'test-user',
                userType: 'attendee',
                topic: 'General Inquiry'
            }},

            // Documentation Tests
            { method: 'GET', endpoint: '/docs', name: 'Get Documentation Index' },
        ];

        for (const test of tests) {
            await this.runTest(test);
            await this.sleep(100); // Small delay between tests
        }

        this.printResults();
        return this.results;
    }

    private async runTest(test: any): Promise<void> {
        const startTime = Date.now();
        
        try {
            const config = {
                method: test.method.toLowerCase(),
                url: `${this.baseUrl}${test.endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token' // Mock auth
                },
                ...(test.data && { data: test.data }),
                timeout: 5000
            };

            const response = await axios(config);
            const responseTime = Date.now() - startTime;

            this.results.push({
                endpoint: test.endpoint,
                method: test.method,
                status: response.status < 400 ? 'PASS' : 'FAIL',
                responseTime
            });

            console.log(`✅ ${test.name}: ${response.status} (${responseTime}ms)`);

        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            
            this.results.push({
                endpoint: test.endpoint,
                method: test.method,
                status: 'FAIL',
                responseTime,
                error: error.message
            });

            console.log(`❌ ${test.name}: FAILED - ${error.message} (${responseTime}ms)`);
        }
    }

    private printResults(): void {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / this.results.length;

        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new APITester();
    tester.runAllTests().catch(console.error);
}

export { APITester };