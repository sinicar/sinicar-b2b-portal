import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn, type ChildProcess } from 'child_process';

function backendServerPlugin(): Plugin {
  let backendProcess: ChildProcess | null = null;

  return {
    name: 'backend-server',
    configureServer() {
      console.log('🚀 Starting backend server...');
      
      backendProcess = spawn('npx', ['tsx', 'src/server.ts'], {
        cwd: path.resolve(__dirname, 'backend'),
        env: {
          ...process.env,
          PORT: '3001',
          NODE_ENV: 'development',
          CORS_ORIGIN: 'http://localhost:5000',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });

      backendProcess.stdout?.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
      });

      backendProcess.stderr?.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
      });

      backendProcess.on('close', (code) => {
        if (code !== null && code !== 0) {
          console.log(`Backend exited with code ${code}`);
        }
      });

      process.on('SIGINT', () => {
        if (backendProcess) {
          backendProcess.kill();
        }
        process.exit();
      });

      process.on('SIGTERM', () => {
        if (backendProcess) {
          backendProcess.kill();
        }
        process.exit();
      });
    },
    closeBundle() {
      if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
      }
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
      },
      plugins: [react(), backendServerPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/api/v1'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
