# orders-service

Orders microservice built with Node.js and Express.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Run in development mode
npm run dev

# Run tests
npm test
```

## Port

The service runs on **port 3001** by default.

Set `PORT` environment variable to change:
```bash
PORT=3002 npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/public/config` | Service configuration |
| GET | `/api/public/status` | Service status |
| GET | `/api/public/docs` | API documentation |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create new order |
| PATCH | `/api/orders/:id/status` | Update order status |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `API_KEY` | API key for external services | - |

## Dependencies

- `express` - Web framework
- `shared-utils` - Shared utility library

## Development

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Known Issues

⚠️ **API Contract Change**: The `shared-utils` library v2.0.0 changed the `formatCurrency` function signature. The `locale` parameter is now required. See `tests/formatting.test.js` for details.

## License

MIT
