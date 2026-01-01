/**
 * SEO Service for SINI CAR B2B Portal
 * Handles all SEO settings CRUD operations, diagnostics, and versioning
 */

import { STORAGE_KEYS } from './storage-keys';
import {
    CompleteSEOSettings,
    SEOSettingsVersion,
    DiagnosticReport,
    SEODiagnostic,
    getDefaultSEOSettings,
    PageSEOConfig,
    PageType
} from '../types/seoTypes';

// ============================================================================
// SEO Service
// ============================================================================

export const SEOService = {
    // ==========================================================================
    // Core CRUD Operations
    // ==========================================================================

    /**
     * Get current SEO settings
     */
    getSEOSettings(): CompleteSEOSettings {
        const stored = localStorage.getItem(STORAGE_KEYS.SEO_SETTINGS);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                console.warn('[SEOService] Failed to parse SEO settings, using defaults');
            }
        }
        return getDefaultSEOSettings();
    },

    /**
     * Save SEO settings with automatic versioning
     */
    saveSEOSettings(
        settings: CompleteSEOSettings,
        updatedBy: string = 'admin',
        description: string = 'Manual update'
    ): CompleteSEOSettings {
        // Update metadata
        const updatedSettings: CompleteSEOSettings = {
            ...settings,
            version: settings.version + 1,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: updatedBy
        };

        // Save current settings
        localStorage.setItem(STORAGE_KEYS.SEO_SETTINGS, JSON.stringify(updatedSettings));

        // Add to version history
        this.addVersionHistory(updatedSettings, updatedBy, description);

        console.log('[SEOService] Settings saved, version:', updatedSettings.version);
        return updatedSettings;
    },

    /**
     * Reset settings to defaults
     */
    resetToDefaults(): CompleteSEOSettings {
        const defaults = getDefaultSEOSettings();
        localStorage.setItem(STORAGE_KEYS.SEO_SETTINGS, JSON.stringify(defaults));
        return defaults;
    },

    // ==========================================================================
    // Version History
    // ==========================================================================

    /**
     * Get version history
     */
    getVersionHistory(): SEOSettingsVersion[] {
        const stored = localStorage.getItem(STORAGE_KEYS.SEO_VERSION_HISTORY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }
        return [];
    },

    /**
     * Add to version history (keeps last 20 versions)
     */
    addVersionHistory(
        settings: CompleteSEOSettings,
        createdBy: string,
        description: string
    ): void {
        const history = this.getVersionHistory();

        const newVersion: SEOSettingsVersion = {
            id: `seo-v${settings.version}-${Date.now()}`,
            version: settings.version,
            createdAt: new Date().toISOString(),
            createdBy,
            description,
            settings: JSON.parse(JSON.stringify(settings)) // Deep clone
        };

        // Add to beginning and limit to 20 versions
        history.unshift(newVersion);
        if (history.length > 20) {
            history.pop();
        }

        localStorage.setItem(STORAGE_KEYS.SEO_VERSION_HISTORY, JSON.stringify(history));
    },

    /**
     * Restore a specific version
     */
    restoreVersion(versionId: string): CompleteSEOSettings | null {
        const history = this.getVersionHistory();
        const version = history.find(v => v.id === versionId);

        if (version) {
            const restored = this.saveSEOSettings(
                version.settings,
                'admin',
                `Restored from version ${version.version}`
            );
            return restored;
        }
        return null;
    },

    // ==========================================================================
    // Page-Level SEO
    // ==========================================================================

    /**
     * Get SEO config for a specific page
     */
    getPageSEO(pageId: PageType): PageSEOConfig | null {
        const settings = this.getSEOSettings();
        return settings.pageLevelSEO.pages.find(p => p.pageId === pageId) || null;
    },

    /**
     * Save SEO config for a specific page
     */
    savePageSEO(config: PageSEOConfig): void {
        const settings = this.getSEOSettings();
        const existingIndex = settings.pageLevelSEO.pages.findIndex(
            p => p.pageId === config.pageId
        );

        if (existingIndex >= 0) {
            settings.pageLevelSEO.pages[existingIndex] = config;
        } else {
            settings.pageLevelSEO.pages.push(config);
        }

        this.saveSEOSettings(settings, 'admin', `Updated page SEO: ${config.pageId}`);
    },

    // ==========================================================================
    // Export / Import
    // ==========================================================================

    /**
     * Export settings as JSON string
     */
    exportSettings(): string {
        const settings = this.getSEOSettings();
        return JSON.stringify(settings, null, 2);
    },

    /**
     * Export settings as downloadable file
     */
    exportToFile(): void {
        const json = this.exportSettings();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `sini-seo-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Import settings from JSON string
     */
    importSettings(jsonString: string): CompleteSEOSettings | null {
        try {
            const imported = JSON.parse(jsonString) as CompleteSEOSettings;

            // Validate basic structure
            if (!imported.global || !imported.structuredData) {
                throw new Error('Invalid SEO settings structure');
            }

            return this.saveSEOSettings(imported, 'admin', 'Imported from file');
        } catch (error) {
            console.error('[SEOService] Import failed:', error);
            return null;
        }
    },

    // ==========================================================================
    // SEO Diagnostics
    // ==========================================================================

    /**
     * Run comprehensive SEO diagnostics
     */
    runDiagnostics(): DiagnosticReport {
        const settings = this.getSEOSettings();
        const diagnostics: SEODiagnostic[] = [];

        // Check Global SEO
        this.checkGlobalSEO(settings, diagnostics);

        // Check Structured Data
        this.checkStructuredData(settings, diagnostics);

        // Check Technical SEO
        this.checkTechnicalSEO(settings, diagnostics);

        // Check Performance
        this.checkPerformanceSEO(settings, diagnostics);

        // Calculate score
        const errors = diagnostics.filter(d => d.severity === 'error').length;
        const warnings = diagnostics.filter(d => d.severity === 'warning').length;
        const passed = diagnostics.filter(d => d.severity === 'success').length;

        // Score calculation: start at 100, -10 per error, -5 per warning
        const score = Math.max(0, 100 - (errors * 10) - (warnings * 5));

        return {
            runAt: new Date().toISOString(),
            score,
            diagnostics,
            summary: { errors, warnings, passed }
        };
    },

    /**
     * Check Global SEO settings
     */
    checkGlobalSEO(settings: CompleteSEOSettings, diagnostics: SEODiagnostic[]): void {
        const { global } = settings;

        // Title check
        if (!global.siteTitle.ar && !global.siteTitle.en) {
            diagnostics.push({
                id: 'global-title-missing',
                category: 'meta',
                severity: 'error',
                title: 'عنوان الموقع مفقود',
                description: 'لم يتم تعيين عنوان للموقع',
                recommendation: 'أضف عنوانًا للموقع في إعدادات SEO العامة',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        } else if (global.siteTitle.ar.length > 60 || global.siteTitle.en.length > 60) {
            diagnostics.push({
                id: 'global-title-long',
                category: 'meta',
                severity: 'warning',
                title: 'عنوان الموقع طويل جداً',
                description: 'يُفضل أن يكون العنوان أقل من 60 حرفاً',
                recommendation: 'اختصر العنوان ليكون أقل من 60 حرفاً',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        } else {
            diagnostics.push({
                id: 'global-title-ok',
                category: 'meta',
                severity: 'success',
                title: 'عنوان الموقع ممتاز',
                description: 'عنوان الموقع موجود وبطول مناسب',
                recommendation: '',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        }

        // Description check
        if (!global.siteDescription.ar && !global.siteDescription.en) {
            diagnostics.push({
                id: 'global-desc-missing',
                category: 'meta',
                severity: 'error',
                title: 'وصف الموقع مفقود',
                description: 'لم يتم تعيين وصف للموقع',
                recommendation: 'أضف وصفاً للموقع في إعدادات SEO العامة',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        } else if (global.siteDescription.ar.length > 160 || global.siteDescription.en.length > 160) {
            diagnostics.push({
                id: 'global-desc-long',
                category: 'meta',
                severity: 'warning',
                title: 'وصف الموقع طويل جداً',
                description: 'يُفضل أن يكون الوصف أقل من 160 حرفاً',
                recommendation: 'اختصر الوصف ليكون أقل من 160 حرفاً',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        } else {
            diagnostics.push({
                id: 'global-desc-ok',
                category: 'meta',
                severity: 'success',
                title: 'وصف الموقع ممتاز',
                description: 'وصف الموقع موجود وبطول مناسب',
                recommendation: '',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        }

        // Open Graph check
        if (!global.openGraph.ogImage) {
            diagnostics.push({
                id: 'og-image-missing',
                category: 'meta',
                severity: 'warning',
                title: 'صورة Open Graph مفقودة',
                description: 'لا توجد صورة افتراضية للمشاركة على وسائل التواصل',
                recommendation: 'أضف صورة OG بحجم 1200x630 بكسل',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        }

        // Canonical URL check
        if (!global.canonicalUrl) {
            diagnostics.push({
                id: 'canonical-missing',
                category: 'meta',
                severity: 'warning',
                title: 'رابط Canonical مفقود',
                description: 'لم يتم تعيين رابط أساسي للموقع',
                recommendation: 'أضف الرابط الأساسي للموقع (مثل https://sinicar.com)',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        }
    },

    /**
     * Check Structured Data settings
     */
    checkStructuredData(settings: CompleteSEOSettings, diagnostics: SEODiagnostic[]): void {
        const { structuredData } = settings;

        // Organization schema
        if (!structuredData.organization.enabled) {
            diagnostics.push({
                id: 'org-schema-disabled',
                category: 'structured_data',
                severity: 'warning',
                title: 'مخطط المؤسسة معطل',
                description: 'مخطط Organization schema غير مفعل',
                recommendation: 'فعّل مخطط المؤسسة لتحسين ظهورك في نتائج البحث',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        } else if (!structuredData.organization.logo) {
            diagnostics.push({
                id: 'org-logo-missing',
                category: 'structured_data',
                severity: 'warning',
                title: 'شعار المؤسسة مفقود',
                description: 'لم يتم تعيين شعار للمؤسسة في Schema',
                recommendation: 'أضف رابط شعار المؤسسة',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        } else {
            diagnostics.push({
                id: 'org-schema-ok',
                category: 'structured_data',
                severity: 'success',
                title: 'مخطط المؤسسة مكتمل',
                description: 'مخطط Organization schema مفعل ومكتمل',
                recommendation: '',
                autoFixable: false,
                detectedAt: new Date().toISOString()
            });
        }

        // Breadcrumb schema
        if (!structuredData.breadcrumb.enabled) {
            diagnostics.push({
                id: 'breadcrumb-disabled',
                category: 'structured_data',
                severity: 'info',
                title: 'مخطط مسار التنقل معطل',
                description: 'Breadcrumb schema غير مفعل',
                recommendation: 'فعّل مخطط مسار التنقل لتحسين تجربة المستخدم',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }
    },

    /**
     * Check Technical SEO settings
     */
    checkTechnicalSEO(settings: CompleteSEOSettings, diagnostics: SEODiagnostic[]): void {
        const { technical } = settings;

        // Robots.txt
        if (!technical.robots.content || technical.robots.content.trim() === '') {
            diagnostics.push({
                id: 'robots-empty',
                category: 'meta',
                severity: 'error',
                title: 'ملف robots.txt فارغ',
                description: 'لم يتم إعداد ملف robots.txt',
                recommendation: 'أضف قواعد robots.txt للتحكم في فهرسة الموقع',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }

        // Sitemap
        if (!technical.sitemap.enabled) {
            diagnostics.push({
                id: 'sitemap-disabled',
                category: 'meta',
                severity: 'warning',
                title: 'خريطة الموقع معطلة',
                description: 'توليد Sitemap معطل',
                recommendation: 'فعّل توليد خريطة الموقع التلقائية',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }

        // Canonical
        if (!technical.canonicalEnabled) {
            diagnostics.push({
                id: 'canonical-disabled',
                category: 'meta',
                severity: 'warning',
                title: 'روابط Canonical معطلة',
                description: 'إنشاء روابط Canonical التلقائية معطل',
                recommendation: 'فعّل روابط Canonical لتجنب المحتوى المكرر',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }
    },

    /**
     * Check Performance SEO settings
     */
    checkPerformanceSEO(settings: CompleteSEOSettings, diagnostics: SEODiagnostic[]): void {
        const { performance } = settings;

        // Lazy loading
        if (!performance.lazyLoading.enabled) {
            diagnostics.push({
                id: 'lazy-loading-disabled',
                category: 'performance',
                severity: 'warning',
                title: 'التحميل الكسول معطل',
                description: 'Lazy loading للصور معطل',
                recommendation: 'فعّل التحميل الكسول لتحسين سرعة الصفحة',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }

        // Image optimization
        if (!performance.images.autoWebP) {
            diagnostics.push({
                id: 'webp-disabled',
                category: 'performance',
                severity: 'info',
                title: 'تحويل WebP معطل',
                description: 'التحويل التلقائي لصيغة WebP معطل',
                recommendation: 'فعّل WebP لتقليل حجم الصور',
                autoFixable: true,
                detectedAt: new Date().toISOString()
            });
        }
    },

    // ==========================================================================
    // Structured Data Generation
    // ==========================================================================

    /**
     * Generate Organization JSON-LD
     */
    generateOrganizationJsonLd(): string {
        const settings = this.getSEOSettings();
        const org = settings.structuredData.organization;

        if (!org.enabled) return '';

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: org.name,
            alternateName: org.alternateName,
            url: org.url,
            logo: org.logo,
            description: org.description,
            email: org.email,
            telephone: org.phone,
            address: {
                '@type': 'PostalAddress',
                streetAddress: org.address.streetAddress,
                addressLocality: org.address.addressLocality,
                addressRegion: org.address.addressRegion,
                postalCode: org.address.postalCode,
                addressCountry: org.address.addressCountry
            },
            sameAs: org.sameAs
        };

        return JSON.stringify(schema, null, 2);
    },

    /**
     * Generate all structured data as JSON-LD script tags
     */
    generateAllJsonLd(): string[] {
        const scripts: string[] = [];

        const orgJsonLd = this.generateOrganizationJsonLd();
        if (orgJsonLd) {
            scripts.push(`<script type="application/ld+json">${orgJsonLd}</script>`);
        }

        return scripts;
    }
};

export default SEOService;
