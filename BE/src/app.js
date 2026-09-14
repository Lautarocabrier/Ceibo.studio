import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir cualquier origen en desarrollo (localhost:3000, localhost:5173, etc.)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers para el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar rutas principales
app.use(routes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador centralizado de errores
app.use(errorHandler);

export default app;
