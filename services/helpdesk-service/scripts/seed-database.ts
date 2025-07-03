// File: services/helpdesk-service/scripts/seed-database.ts
// Database Seeding Script
import { getDataSource } from '../app/config/database';
import { HeroSection } from '../app/models/entities/HeroSection.entity';
import { MediaLibrary } from '../app/models/entities/MediaLibrary.entity';
import { Survey } from '../app/models/entities/Survey.entity';
import { SurveyQuestion } from '../app/models/entities/SurveyQuestion.entity';
import { ContentSection } from '../app/models/entities/ContentSection.entity';
import { FAQ } from '../app/models/entities/FAQ.entity';
import { SiteSetting } from '../app/models/entities/SiteSetting.entity';

class DatabaseSeeder {
    private dataSource: any;

    async initialize() {
        this.dataSource = await getDataSource();
        console.log('📦 Database connection established');
    }

    async seedAll() {
        console.log('🌱 Starting database seeding...\n');
        
        await this.seedHeroSections();
        await this.seedMediaLibrary();
        await this.seedSurveys();
        await this.seedContentSections();
        await this.seedFAQs();
        await this.seedSiteSettings();
        
        console.log('\n✅ Database seeding completed!');
    }

    async seedHeroSections() {
        console.log('📸 Seeding hero sections...');
        const repository = this.dataSource.getRepository(HeroSection);
        
        const heroSections = [
            {
                title: 'Welcome to LITF 2025',
                subtitle: 'Lagos International Trade Fair',
                description: 'Join thousands of exhibitors and attendees in Nigeria\'s premier trade event. Discover opportunities, network with industry leaders, and grow your business.',
                background_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                cta_text: 'Register Now',
                cta_link: '/register',
                display_order: 1,
                created_by: 'system'
            },
            {
                title: 'Exhibit Your Products',
                subtitle: 'Showcase to Thousands',
                description: 'Book your booth space and reach potential customers from across West Africa. Premium locations still available.',
                background_image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=2012&q=80',
                cta_text: 'Book Booth',
                cta_link: '/exhibitor/booth',
                display_order: 2,
                created_by: 'system'
            }
        ];

        for (const heroData of heroSections) {
            const hero = repository.create(heroData);
            await repository.save(hero);
        }
        
        console.log(`✅ Created ${heroSections.length} hero sections`);
    }

    async seedMediaLibrary() {
        console.log('🖼️  Seeding media library...');
        const repository = this.dataSource.getRepository(MediaLibrary);
        
        const mediaFiles = [
            {
                file_name: 'trade-fair-banner.jpg',
                original_name: 'trade-fair-banner.jpg',
                file_path: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                file_type: 'image/jpeg',
                file_size: 2048000,
                alt_text: 'Trade fair exhibition hall',
                caption: 'Main exhibition hall during LITF 2024',
                tags: 'trade fair, exhibition, hall, events',
                uploaded_by: 'system'
            },
            {
                file_name: 'networking-event.jpg',
                original_name: 'networking-event.jpg',
                file_path: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=2012&q=80',
                file_type: 'image/jpeg',
                file_size: 1536000,
                alt_text: 'Business networking event',
                caption: 'Networking session at LITF',
                tags: 'networking, business, professionals',
                uploaded_by: 'system'
            }
        ];

        for (const mediaData of mediaFiles) {
            const media = repository.create(mediaData);
            await repository.save(media);
        }
        
        console.log(`✅ Created ${mediaFiles.length} media files`);
    }

    async seedSurveys() {
        console.log('📋 Seeding surveys...');
        const surveyRepository = this.dataSource.getRepository(Survey);
        const questionRepository = this.dataSource.getRepository(SurveyQuestion);
        
        const surveyData = {
            title: 'Event Experience Survey',
            description: 'Help us improve future trade fairs by sharing your experience',
            target_audience: 'all',
            max_responses: 1000,
            created_by: 'system'
        };

        const survey = surveyRepository.create(surveyData);
        const savedSurvey = await surveyRepository.save(survey);

        const questions = [
            {
                survey_id: savedSurvey.id,
                question_text: 'How would you rate your overall experience?',
                question_type: 'rating',
                options: { scale: 5 },
                is_required: true,
                display_order: 1
            },
            {
                survey_id: savedSurvey.id,
                question_text: 'What type of attendee are you?',
                question_type: 'multiple_choice',
                options: { options: ['Exhibitor', 'Visitor', 'Media', 'Sponsor', 'Staff'] },
                is_required: true,
                display_order: 2
            },
            {
                survey_id: savedSurvey.id,
                question_text: 'What improvements would you suggest?',
                question_type: 'text',
                is_required: false,
                display_order: 3
            }
        ];

        for (const questionData of questions) {
            const question = questionRepository.create(questionData);
            await questionRepository.save(question);
        }
        
        console.log(`✅ Created survey with ${questions.length} questions`);
    }

    async seedContentSections() {
        console.log('📄 Seeding content sections...');
        const repository = this.dataSource.getRepository(ContentSection);
        
        const contentSections = [
            {
                section_name: 'About LITF',
                section_type: 'text',
                title: 'About Lagos International Trade Fair',
                content: '<p>The Lagos International Trade Fair is West Africa\'s largest trade exhibition, bringing together businesses, entrepreneurs, and industry leaders from across the continent. Our mission is to facilitate trade, promote economic growth, and create lasting business relationships.</p><p>Since 1981, LITF has been the premier platform for showcasing products, services, and innovations across various industries including manufacturing, agriculture, technology, and services.</p>',
                page_location: 'homepage',
                display_order: 1,
                created_by: 'system'
            },
            {
                section_name: 'Key Features',
                section_type: 'features',
                title: 'Why Choose LITF 2025?',
                content: 'Discover the benefits of participating in Nigeria\'s premier trade event',
                page_location: 'homepage',
                display_order: 2,
                created_by: 'system'
            },
            {
                section_name: 'Registration CTA',
                section_type: 'cta',
                title: 'Ready to Join LITF 2025?',
                content: 'Register now and be part of the biggest trade fair in West Africa. Early bird discounts available!',
                settings: {
                    button_text: 'Register Today',
                    button_link: '/register'
                },
                page_location: 'homepage',
                display_order: 3,
                created_by: 'system'
            }
        ];

        for (const sectionData of contentSections) {
            const section = repository.create(sectionData);
            await repository.save(section);
        }
        
        console.log(`✅ Created ${contentSections.length} content sections`);
    }

    async seedFAQs() {
        console.log('❓ Seeding FAQs...');
        const repository = this.dataSource.getRepository(FAQ);
        
        const faqs = [
            {
                question: 'When is LITF 2025?',
                answer: 'LITF 2025 will be held from November 1-10, 2025 at the Tafawa Balewa Square, Lagos Island.',
                category: 'General',
                priority: 1,
                tags: 'dates, schedule, when',
                created_by: 'system'
            },
            {
                question: 'How do I register as an exhibitor?',
                answer: 'You can register as an exhibitor through our online portal. Visit the exhibitor registration page, complete the form, select your booth space, and make payment online.',
                category: 'Registration',
                priority: 1,
                tags: 'exhibitor, registration, booth',
                created_by: 'system'
            },
            {
                question: 'What are the booth sizes and prices?',
                answer: 'We offer various booth sizes: Standard (3x3m) - ₦150,000, Premium (3x6m) - ₦280,000, Corporate (6x6m) - ₦500,000. All prices include basic booth setup.',
                category: 'Booth Management',
                priority: 2,
                tags: 'booth, prices, sizes, cost',
                created_by: 'system'
            },
            {
                question: 'Is there parking available?',
                answer: 'Yes, we provide ample parking space for exhibitors and visitors. Parking is free for the first 4 hours, then ₦500 per additional hour.',
                category: 'General',
                priority: 3,
                tags: 'parking, venue, facilities',
                created_by: 'system'
            }
        ];

        for (const faqData of faqs) {
            const faq = repository.create(faqData);
            await repository.save(faq);
        }
        
        console.log(`✅ Created ${faqs.length} FAQs`);
    }

    async seedSiteSettings() {
        console.log('⚙️  Seeding site settings...');
        const repository = this.dataSource.getRepository(SiteSetting);
        
        const settings = [
            {
                setting_key: 'site_name',
                setting_value: 'LITF 2025 - Lagos International Trade Fair',
                setting_type: 'text',
                description: 'Main site name displayed in headers and titles',
                category: 'general'
            },
            {
                setting_key: 'contact_email',
                setting_value: 'info@litf2025.com',
                setting_type: 'text',
                description: 'Primary contact email address',
                category: 'general'
            },
            {
                setting_key: 'contact_phone',
                setting_value: '+234-1-234-5678',
                setting_type: 'text',
                description: 'Primary contact phone number',
                category: 'general'
            },
            {
                setting_key: 'event_start_date',
                setting_value: '2025-11-01',
                setting_type: 'text',
                description: 'Trade fair start date',
                category: 'event'
            },
            {
                setting_key: 'event_end_date',
                setting_value: '2025-11-10',
                setting_type: 'text',
                description: 'Trade fair end date',
                category: 'event'
            },
            {
                setting_key: 'registration_enabled',
                setting_value: 'true',
                setting_type: 'boolean',
                description: 'Enable/disable online registration',
                category: 'registration'
            },
            {
                setting_key: 'chat_enabled',
                setting_value: 'true',
                setting_type: 'boolean',
                description: 'Enable/disable live chat support',
                category: 'chat'
            },
            {
                setting_key: 'max_file_size',
                setting_value: '10485760',
                setting_type: 'number',
                description: 'Maximum file upload size in bytes (10MB)',
                category: 'uploads'
            }
        ];

        for (const settingData of settings) {
            const setting = repository.create({
                ...settingData,
                updated_by: 'system'
            });
            await repository.save(setting);
        }
        
        console.log(`✅ Created ${settings.length} site settings`);
    }

    async cleanup() {
        if (this.dataSource) {
            await this.dataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run seeder if this file is executed directly
if (require.main === module) {
    const seeder = new DatabaseSeeder();
    seeder.initialize()
        .then(() => seeder.seedAll())
        .finally(() => seeder.cleanup())
        .catch(console.error);
}

export { DatabaseSeeder };
