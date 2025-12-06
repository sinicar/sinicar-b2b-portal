import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn, type ChildProcess } from 'child_process';

function backendServerPlugin(): Plugin {
  let backendProcess: ChildProcess | null = null;
  let isShuttingDown = false;

  const killBackend = () => {
    if (backendProcess && !isShuttingDown) {
      isShuttingDown = true;
      backendProcess.kill('SIGTERM');
      setTimeout(() => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill('SIGKILL');
        }
        backendProcess = null;
        isShuttingDown = false;
      }, 2000);
    }
  };

  return {
    name: 'backend-server',
    configureServer(server) {
      if (backendProcess) {
        killBackend();
      }
      
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
        if (code !== null && code !== 0 && !isShuttingDown) {
          console.log(`Backend exited with code ${code}`);
        }
      });

      server.httpServer?.on('close', () => {
        killBackend();
      });

      process.on('SIGINT', () => {
        killBackend();
        process.exit();
      });

      process.on('SIGTERM', () => {
        killBackend();
        process.exit();
      });
    },
    closeBundle() {
      killBackend();
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
