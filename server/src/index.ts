import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import dossierRoutes from './routes/dossiers';
import timeEntryRoutes from './routes/timeEntries';
import invoiceRoutes from './routes/invoices';
import documentRoutes from './routes/documents';
import aiRoutes from './routes/ai';
import packageRoutes from './routes/packages';
import dashboardRoutes from './routes/dashboard';

const app = express();

const isProd = process.env.NODE_ENV === 'production';
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(isProd ? './uploads' : './src/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve React frontend in production
if (isProd) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Interner Serverfehler' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`smartlaw Server läuft auf Port ${PORT}`));
