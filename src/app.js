const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { notFound, errorHandler } = require('./middleware/error');
const { UPLOAD_DIR } = require('./services/storage');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(UPLOAD_DIR)); // local audio files (supports range requests)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => res.json({ success: true, service: 'TuneStream API' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tracks', require('./routes/trackRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/artists', require('./routes/artistRoutes'));
app.use('/api', require('./routes/extrasRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
