/**
 * SEO Types for SINI CAR B2B Portal
 * Advanced SEO Settings Center Types
 */

// ============================================================================
// Multi-language Support
// ============================================================================

export type SEOLanguage = 'ar' | 'en' | 'cn' | 'hi';

export interface MultilingualText {
    ar: string;
    en: string;
    cn?: string;
    hi?: string;
}

// ============================================================================
// Global SEO Settings
// ============================================================================

export interface OpenGraphSettings {
    ogTitle: MultilingualText;
    ogDescription: MultilingualText;
    ogImage: string;
    ogType: 'website' | 'article' | 'product';
    ogSiteName: MultilingualText;
    ogLocale: string;
}

export interface TwitterCardSettings {
    cardType: 'summary' | 'summary_large_image' | 'app' | 'player';
    site: string;
    creator: string;
    title: MultilingualText;
    description: MultilingualText;
    image: string;
}

export interface GlobalSEOSettings {
    // Basic Meta
    siteTitle: MultilingualText;
    siteDescription: MultilingualText;
    siteKeywords: MultilingualText;

    // Canonical & URLs
    canonicalUrl: string;
    baseUrl: string;

    // Open Graph
    openGraph: OpenGraphSettings;

    // Twitter Cards
    twitterCard: TwitterCardSettings;

    // Favicon & Icons
    favicon: string;
    appleTouchIcon: string;

    // Verification
    googleVerification: string;
    bingVerification: string;

    // Custom Meta Tags
    customMetaTags: CustomMetaTag[];

    // Last Updated
    updatedAt: string;
    updatedBy: string;
}

export interface CustomMetaTag {
    id: string;
    name: string;
    content: string;
    type: 'name' | 'property' | 'http-equiv';
    language?: SEOLanguage;
}

// ============================================================================
// Structured Data (Schema.org)
// ============================================================================

export interface OrganizationSchema {
    enabled: boolean;
    name: string;
    alternateName?: string;
    url: string;
    logo: string;
    description: string;
    email: string;
    phone: string;
    address: {
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: string;
    };
    sameAs: string[]; // Social media URLs
}

export interface ProductSchemaTemplate {
    enabled: boolean;
    brandName: string;
    currencyCode: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    priceValidUntil: string;
    returnPolicy: string;
    shippingDetails: string;
}

export interface BreadcrumbSchema {
    enabled: boolean;
    homeLabel: MultilingualText;
    separator: string;
}

export interface FAQSchemaItem {
    id: string;
    question: MultilingualText;
    answer: MultilingualText;
}

export interface FAQSchema {
    enabled: boolean;
    items: FAQSchemaItem[];
}

export interface StructuredDataSettings {
    organization: OrganizationSchema;
    product: ProductSchemaTemplate;
    breadcrumb: BreadcrumbSchema;
    faq: FAQSchema;
    customJsonLd: string; // Raw JSON-LD for advanced users
}

// ============================================================================
// Page-Level SEO
// ============================================================================

export type PageType =
    | 'dashboard'
    | 'product_search'
    | 'product_details'
    | 'supplier_portal'
    | 'customer_portal'
    | 'tools'
    | 'reports'
    | 'quote_request'
    | 'import_china'
    | 'orders'
    | 'about'
    | 'contact'
    | 'register'
    | 'login';

export interface PageSEOConfig {
    pageId: PageType;
    enabled: boolean;

    // Override metadata
    title: MultilingualText;
    description: MultilingualText;
    keywords: MultilingualText;

    // Template variables (e.g., {productName}, {category})
    titleTemplate: string;
    descriptionTemplate: string;

    // Page-specific OG
    ogImage?: string;

    // Indexing
    noIndex: boolean;
    noFollow: boolean;

    // Priority for sitemap
    priority: number; // 0.0 - 1.0
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export interface PageLevelSEOSettings {
    pages: PageSEOConfig[];
    useTemplates: boolean;
    defaultPriority: number;
    defaultChangeFrequency: 'daily' | 'weekly' | 'monthly';
}

// ============================================================================
// Performance SEO
// ============================================================================

export interface LazyLoadingConfig {
    enabled: boolean;
    images: boolean;
    iframes: boolean;
    threshold: number; // pixels from viewport
}

export interface PreloadConfig {
    fonts: string[];
    criticalCss: boolean;
    preconnectDomains: string[];
    prefetchPages: string[];
    dnsPrefetch: string[];
}

export interface ScriptConfig {
    deferNonCritical: boolean;
    asyncAnalytics: boolean;
    inlineSmallScripts: boolean;
    bundleThreshold: number; // KB
}

export interface ImageOptimizationConfig {
    autoWebP: boolean;
    lazyLoad: boolean;
    defaultQuality: number; // 1-100
    maxWidth: number;
    placeholderType: 'blur' | 'skeleton' | 'none';
}

export interface PerformanceSEOSettings {
    lazyLoading: LazyLoadingConfig;
    preload: PreloadConfig;
    scripts: ScriptConfig;
    images: ImageOptimizationConfig;
}

// ============================================================================
// Technical SEO
// ============================================================================

export interface RobotsConfig {
    content: string; // Full robots.txt content
    additionalRules: RobotsRule[];
}

export interface RobotsRule {
    id: string;
    userAgent: string;
    allow: string[];
    disallow: string[];
}

export interface SitemapConfig {
    enabled: boolean;
    includeImages: boolean;
    includeLastMod: boolean;
    excludePatterns: string[];
    additionalUrls: SitemapUrl[];
    autoGenerate: boolean;
}

export interface SitemapUrl {
    url: string;
    priority: number;
    changeFrequency: string;
    lastMod?: string;
}

export interface UrlNormalizationConfig {
    forceTrailingSlash: boolean;
    forceLowercase: boolean;
    removeQueryParams: string[];
    redirectWww: 'to-www' | 'to-non-www' | 'none';
}

export interface TechnicalSEOSettings {
    robots: RobotsConfig;
    sitemap: SitemapConfig;
    urlNormalization: UrlNormalizationConfig;
    canonicalEnabled: boolean;
    hreflangEnabled: boolean;
}

// ============================================================================
// SEO Diagnostics
// ============================================================================

export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'success';

export type DiagnosticCategory =
    | 'meta'
    | 'structured_data'
    | 'performance'
    | 'accessibility'
    | 'mobile'
    | 'security';

export interface SEODiagnostic {
    id: string;
    category: DiagnosticCategory;
    severity: DiagnosticSeverity;
    title: string;
    description: string;
    affectedPage?: string;
    recommendation: string;
    autoFixable: boolean;
    detectedAt: string;
}

export interface DiagnosticReport {
    runAt: string;
    score: number; // 0-100
    diagnostics: SEODiagnostic[];
    summary: {
        errors: number;
        warnings: number;
        passed: number;
    };
}

// ============================================================================
// Version History
// ============================================================================

export interface SEOSettingsVersion {
    id: string;
    version: number;
    createdAt: string;
    createdBy: string;
    description: string;
    settings: CompleteSEOSettings;
}

// ============================================================================
// Complete Settings Object
// ============================================================================

export interface CompleteSEOSettings {
    global: GlobalSEOSettings;
    structuredData: StructuredDataSettings;
    pageLevelSEO: PageLevelSEOSettings;
    performance: PerformanceSEOSettings;
    technical: TechnicalSEOSettings;

    // Metadata
    version: number;
    lastUpdated: string;
    lastUpdatedBy: string;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_GLOBAL_SEO: GlobalSEOSettings = {
    siteTitle: {
        ar: 'صيني كار - بوابة عملاء الجملة',
        en: 'SINI CAR - Wholesale B2B Portal'
    },
    siteDescription: {
        ar: 'بوابة قطع غيار السيارات بالجملة - أكبر منصة لتجار قطع الغيار في المملكة',
        en: 'Wholesale Auto Parts Portal - The largest platform for auto parts dealers in Saudi Arabia'
    },
    siteKeywords: {
        ar: 'قطع غيار, سيارات, جملة, تاجر, صيني كار',
        en: 'auto parts, wholesale, dealer, SINI CAR, Saudi Arabia'
    },
    canonicalUrl: 'https://sinicar.com',
    baseUrl: 'https://sinicar.com',
    openGraph: {
        ogTitle: { ar: 'صيني كار', en: 'SINI CAR' },
        ogDescription: { ar: 'بوابة قطع غيار السيارات بالجملة', en: 'Wholesale Auto Parts Portal' },
        ogImage: '/og-image.jpg',
        ogType: 'website',
        ogSiteName: { ar: 'صيني كار', en: 'SINI CAR' },
        ogLocale: 'ar_SA'
    },
    twitterCard: {
        cardType: 'summary_large_image',
        site: '@sinicar',
        creator: '@sinicar',
        title: { ar: 'صيني كار', en: 'SINI CAR' },
        description: { ar: 'بوابة قطع غيار السيارات بالجملة', en: 'Wholesale Auto Parts Portal' },
        image: '/twitter-card.jpg'
    },
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png',
    googleVerification: '',
    bingVerification: '',
    customMetaTags: [],
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
};

export const DEFAULT_STRUCTURED_DATA: StructuredDataSettings = {
    organization: {
        enabled: true,
        name: 'SINI CAR',
        alternateName: 'صيني كار',
        url: 'https://sinicar.com',
        logo: 'https://sinicar.com/logo.png',
        description: 'Wholesale Auto Parts Portal',
        email: 'info@sinicar.com',
        phone: '+966500000000',
        address: {
            streetAddress: '',
            addressLocality: 'Riyadh',
            addressRegion: 'Riyadh',
            postalCode: '',
            addressCountry: 'SA'
        },
        sameAs: []
    },
    product: {
        enabled: true,
        brandName: 'SINI CAR',
        currencyCode: 'SAR',
        availability: 'InStock',
        priceValidUntil: '',
        returnPolicy: '',
        shippingDetails: ''
    },
    breadcrumb: {
        enabled: true,
        homeLabel: { ar: 'الرئيسية', en: 'Home' },
        separator: '/'
    },
    faq: {
        enabled: false,
        items: []
    },
    customJsonLd: ''
};

export const DEFAULT_PERFORMANCE_SEO: PerformanceSEOSettings = {
    lazyLoading: {
        enabled: true,
        images: true,
        iframes: true,
        threshold: 200
    },
    preload: {
        fonts: [],
        criticalCss: true,
        preconnectDomains: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        prefetchPages: [],
        dnsPrefetch: []
    },
    scripts: {
        deferNonCritical: true,
        asyncAnalytics: true,
        inlineSmallScripts: true,
        bundleThreshold: 50
    },
    images: {
        autoWebP: true,
        lazyLoad: true,
        defaultQuality: 80,
        maxWidth: 1920,
        placeholderType: 'skeleton'
    }
};

export const DEFAULT_TECHNICAL_SEO: TechnicalSEOSettings = {
    robots: {
        content: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://sinicar.com/sitemap.xml`,
        additionalRules: []
    },
    sitemap: {
        enabled: true,
        includeImages: true,
        includeLastMod: true,
        excludePatterns: ['/admin/*', '/api/*'],
        additionalUrls: [],
        autoGenerate: true
    },
    urlNormalization: {
        forceTrailingSlash: false,
        forceLowercase: true,
        removeQueryParams: ['utm_source', 'utm_medium', 'utm_campaign'],
        redirectWww: 'to-non-www'
    },
    canonicalEnabled: true,
    hreflangEnabled: true
};

export const DEFAULT_PAGE_LEVEL_SEO: PageLevelSEOSettings = {
    pages: [],
    useTemplates: true,
    defaultPriority: 0.5,
    defaultChangeFrequency: 'weekly'
};

export const getDefaultSEOSettings = (): CompleteSEOSettings => ({
    global: DEFAULT_GLOBAL_SEO,
    structuredData: DEFAULT_STRUCTURED_DATA,
    pageLevelSEO: DEFAULT_PAGE_LEVEL_SEO,
    performance: DEFAULT_PERFORMANCE_SEO,
    technical: DEFAULT_TECHNICAL_SEO,
    version: 1,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: 'system'
});
