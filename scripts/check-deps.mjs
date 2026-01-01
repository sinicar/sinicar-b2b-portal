#!/usr/bin/env node
/**
 * Dependency Safety Check
 * يفحص أن modules لا تستورد من api.ts (لتجنب circular imports)
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Use process.cwd() since script is run from project root
const modulesDir = join(process.cwd(), 'src/services/api/modules');

let hasErrors = false;

console.log('🔍 Checking for forbidden imports in API modules...\n');

if (!existsSync(modulesDir)) {
  console.log('⚠️ Modules directory not found:', modulesDir);
  console.log('✅ Skipping check (no modules to validate)\n');
  process.exit(0);
}

try {
  const files = readdirSync(modulesDir).filter(f => f.endsWith('.ts'));
  
  for (const file of files) {
    if (file === 'index.ts') continue;
    
    const filePath = join(modulesDir, file);
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for imports from api.ts
    if (content.includes("from '../api'") || 
        content.includes("from '../../api'") ||
        content.includes('from "../api"') ||
        content.includes('from "../../api"') ||
        content.includes("from '../../api.ts'") ||
        content.includes("from '../api.ts'")) {
      console.error(`❌ ${file}: Imports from api.ts (FORBIDDEN - causes circular dependency)`);
      hasErrors = true;
    }
    
    // Check for direct fetch usage
    if (content.includes('fetch(') && !content.includes('// fetch allowed')) {
      console.warn(`⚠️  ${file}: Uses direct fetch() - prefer get/post/put/del from apiClient`);
    }
  }
  
  if (!hasErrors) {
    console.log('✅ All modules are clean - no forbidden imports detected!\n');
    console.log('Modules checked:');
    files.filter(f => f !== 'index.ts').forEach(f => console.log(`  ✓ ${f}`));
  }
  
} catch (error) {
  console.error('Error reading modules directory:', error.message);
  process.exit(1);
}

console.log('');
process.exit(hasErrors ? 1 : 0);
