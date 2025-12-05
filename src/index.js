const express = require('express');
const publicRoutes = require('./routes/public');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'orders-service' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Orders service running on port ${PORT}`);
  });
}

module.exports = app;
