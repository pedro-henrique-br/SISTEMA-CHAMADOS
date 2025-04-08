import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    server: {
        host: '10.2.148.11', // Substitua pelo IP correto
        port: 5173,          // Porta padrão do Vite
        hmr: {
            host: '10.2.148.11',
        },
    },
    build: {
        rollupOptions: {
            onwarn(warning, warn) {
                if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                  return;
                }
                warn(warning);
              },
            output: {
                manualChunks: {
                    // Divide React e ReactDOM em chunks separados
                    react: ['react', 'react-dom'],
                    // Divide dependências do FullCalendar
                    fullcalendar: ['@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid'],
                },
            },
        },
        chunkSizeWarningLimit: 5000, // Ajusta o limite do aviso para 1 MB (opcional)
    },
    plugins: [
        laravel([
            'resources/js/index.jsx',
        ]),
    ],
});
