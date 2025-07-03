// File: services/client-ui-service/src/utils/testHelpers.tsx
// React Testing Utilities
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock API service for testing
export const mockApiService = {
    getHeroSections: jest.fn(),
    createHeroSection: jest.fn(),
    updateHeroSection: jest.fn(),
    deleteHeroSection: jest.fn(),
    getMediaFiles: jest.fn(),
    uploadMedia: jest.fn(),
    getSurveys: jest.fn(),
    createSurvey: jest.fn(),
    getContentSections: jest.fn(),
    createContentSection: jest.fn(),
    getFAQs: jest.fn(),
    createFAQ: jest.fn(),
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[];
    user?: any;
}

export const renderWithProviders = (
    ui: React.ReactElement,
    options: CustomRenderOptions = {}
) => {
    const { initialEntries = ['/'], user = null, ...renderOptions } = options;

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <BrowserRouter>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </BrowserRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data generators
export const generateMockHeroSection = (overrides = {}) => ({
    id: '1',
    title: 'Test Hero Section',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    background_image: 'https://example.com/image.jpg',
    cta_text: 'Learn More',
    cta_link: '/learn-more',
    is_active: true,
    display_order: 1,
    created_by: 'test-user',
    created_at: '2025-05-30T10:00:00Z',
    updated_at: '2025-05-30T10:00:00Z',
    ...overrides
});

export const generateMockSurvey = (overrides = {}) => ({
    id: '1',
    title: 'Test Survey',
    description: 'Test Description',
    is_active: true,
    target_audience: 'all',
    created_at: '2025-05-30T10:00:00Z',
    questions: [
        {
            id: '1',
            question_text: 'Test Question?',
            question_type: 'text',
            is_required: true,
            display_order: 1
        }
    ],
    ...overrides
});

export const generateMockContentSection = (overrides = {}) => ({
    id: '1',
    section_name: 'Test Section',
    section_type: 'text',
    title: 'Test Title',
    content: 'Test content',
    page_location: 'homepage',
    display_order: 1,
    is_active: true,
    created_by: 'test-user',
    created_at: '2025-05-30T10:00:00Z',
    updated_at: '2025-05-30T10:00:00Z',
    ...overrides
});
