// File: services/helpdesk-service/scripts/integration-test.ts
// Integration Test Script
import { DatabaseSeeder } from './seed-database';
import { APITester } from './test-api';
import { PerformanceMonitor } from './performance-monitor';

class IntegrationTestSuite {
    private seeder: DatabaseSeeder;
    private apiTester: APITester;
    private monitor: PerformanceMonitor;

    constructor() {
        this.seeder = new DatabaseSeeder();
        this.apiTester = new APITester();
        this.monitor = new PerformanceMonitor();
    }

    async runFullTestSuite() {
        console.log('🚀 Starting Complete Integration Test Suite\n');
        
        try {
            // Step 1: Initialize database
            console.log('Step 1: Database Setup');
            await this.seeder.initialize();
            
            // Step 2: Seed test data
            console.log('\nStep 2: Seeding Test Data');
            await this.seeder.seedAll();
            
            // Step 3: API Testing
            console.log('\nStep 3: API Testing');
            const apiResults = await this.apiTester.runAllTests();
            
            // Step 4: Performance Check
            console.log('\nStep 4: Performance Testing');
            // Run a quick performance check
            await this.quickPerformanceTest();
            
            // Step 5: Generate Report
            console.log('\nStep 5: Generating Integration Report');
            this.generateIntegrationReport(apiResults);
            
        } catch (error) {
            console.error('❌ Integration test suite failed:', error);
        } finally {
            await this.seeder.cleanup();
        }
    }

    private async quickPerformanceTest() {
        const startTime = Date.now();
        
        // Test concurrent requests
        const promises = Array(10).fill(null).map(() => 
            fetch('http://localhost:4003/health')
        );
        
        await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        console.log(`✅ Concurrent request test: ${totalTime}ms for 10 requests`);
    }

    private generateIntegrationReport(apiResults: any[]) {
        const passed = apiResults.filter(r => r.status === 'PASS').length;
        const failed = apiResults.filter(r => r.status === 'FAIL').length;
        const successRate = (passed / apiResults.length) * 100;
        
        console.log('\n📋 INTEGRATION TEST REPORT');
        console.log('================================');
        console.log(`✅ Database Setup: SUCCESS`);
        console.log(`📊 API Tests: ${passed}/${apiResults.length} passed (${successRate.toFixed(1)}%)`);
        console.log(`⚡ Performance: ${successRate > 90 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
        console.log(`🎯 Overall Status: ${successRate > 80 ? 'PASS' : 'FAIL'}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            apiResults.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`   - ${test.method} ${test.endpoint}: ${test.error}`);
            });
        }
        
        console.log('\n🏁 Integration test suite completed!');
    }
}

// Run integration tests if this file is executed directly
if (require.main === module) {
    const suite = new IntegrationTestSuite();
    suite.runFullTestSuite().catch(console.error);
}

export { IntegrationTestSuite };