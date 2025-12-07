import { Router, Response } from 'express';
import { reportService, ReportFilters } from './report.service';
import { reportAIService, AIPromptType } from './report-ai.service';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/permission.middleware';

const router = Router();

router.get('/definitions', 
  authMiddleware,
  requirePermission('REPORTS_ACCESS', 'read'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role || 'CUSTOMER_OWNER';
      
      const definitions = await reportService.getDefinitionsForUser(userRole);
      
      const response = definitions.map(def => ({
        id: def.id,
        code: def.code,
        name: def.name,
        nameAr: def.nameAr,
        nameEn: def.nameEn,
        description: def.description,
        descriptionAr: def.descriptionAr,
        descriptionEn: def.descriptionEn,
        category: def.category
      }));

      res.json({
        success: true,
        data: response,
        count: response.length
      });
    } catch (error: any) {
      console.error('Failed to get report definitions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve report definitions'
      });
    }
  }
);

router.get('/definitions/:code', 
  authMiddleware,
  requirePermission('REPORTS_ACCESS', 'read'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.params;
      const userRole = req.user?.role || 'CUSTOMER_OWNER';
      
      const definition = await reportService.getDefinitionByCode(code);
      
      if (!definition) {
        return res.status(404).json({
          success: false,
          error: 'Report not found'
        });
      }

      if (definition.allowedRoles && definition.allowedRoles.length > 0) {
        if (!definition.allowedRoles.includes(userRole) && !definition.allowedRoles.includes('*')) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this report'
          });
        }
      }

      res.json({
        success: true,
        data: {
          id: definition.id,
          code: definition.code,
          name: definition.name,
          nameAr: definition.nameAr,
          nameEn: definition.nameEn,
          description: definition.description,
          descriptionAr: definition.descriptionAr,
          descriptionEn: definition.descriptionEn,
          category: definition.category,
          isActive: definition.isActive
        }
      });
    } catch (error: any) {
      console.error('Failed to get report definition:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve report definition'
      });
    }
  }
);

router.post('/:code/run', 
  authMiddleware,
  requirePermission('REPORTS_ACCESS', 'create'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.params;
      const filters: ReportFilters = req.body.filters || {};
      const userId = req.user?.id || 'anonymous';
      const userRole = req.user?.role || 'CUSTOMER_OWNER';

      if (filters.dateFrom && isNaN(Date.parse(filters.dateFrom))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid dateFrom format'
        });
      }
      if (filters.dateTo && isNaN(Date.parse(filters.dateTo))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid dateTo format'
        });
      }
      if (filters.page && (isNaN(parseInt(filters.page, 10)) || parseInt(filters.page, 10) < 1)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid page number'
        });
      }

      const result = await reportService.runReport(code, filters, userId, userRole);

      if (!result.success) {
        const statusCode = result.error === 'Report not found' ? 404 :
                           result.error === 'Access denied to this report' ? 403 : 400;
        return res.status(statusCode).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error: any) {
      console.error('Failed to run report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute report'
      });
    }
  }
);

router.post('/:code/analyze',
  authMiddleware,
  requirePermission('REPORTS_AI_ACCESS', 'create'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.params;
      const filters: ReportFilters = req.body.filters || {};
      const mode: AIPromptType = req.body.mode === 'INSIGHTS' ? 'INSIGHTS' : 'SUMMARY';
      const userId = req.user?.id || 'anonymous';
      const userRole = req.user?.role || 'CUSTOMER_OWNER';

      const reportResult = await reportService.runReport(code, filters, userId, userRole);

      if (!reportResult.success) {
        const statusCode = reportResult.error === 'Report not found' ? 404 :
                           reportResult.error === 'Access denied to this report' ? 403 : 400;
        return res.status(statusCode).json({
          success: false,
          error: reportResult.error
        });
      }

      const aiResult = await reportAIService.analyzeReport(
        code,
        reportResult.data,
        filters,
        mode,
        userId
      );

      if (!aiResult.success) {
        const statusCode = aiResult.rateLimited ? 429 : 500;
        return res.status(statusCode).json({
          success: false,
          error: aiResult.error
        });
      }

      res.json({
        success: true,
        data: {
          aiText: aiResult.aiText,
          cached: aiResult.cached,
          mode
        }
      });
    } catch (error: any) {
      console.error('Failed to analyze report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze report'
      });
    }
  }
);

router.get('/logs', 
  authMiddleware,
  requirePermission('REPORTS_ACCESS', 'read'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { reportCode, limit } = req.query;
      
      const logs = await reportService.getExecutionLogs(
        reportCode as string | undefined,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        data: logs,
        count: logs.length
      });
    } catch (error: any) {
      console.error('Failed to get execution logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve execution logs'
      });
    }
  }
);

router.get('/ai-logs',
  authMiddleware,
  requirePermission('REPORTS_AI_ACCESS', 'read'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { reportCode, limit } = req.query;

      const logs = await reportAIService.getAnalysisLogs(
        reportCode as string | undefined,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        data: logs,
        count: logs.length
      });
    } catch (error: any) {
      console.error('Failed to get AI analysis logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve AI analysis logs'
      });
    }
  }
);

export default router;
