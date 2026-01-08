// Export all services from a single entry point

// API Client
export { ApiError } from './apiClient';

// Auth service
export * as auth from './authService';

// Public API service (no authentication required)
export { publicApiService } from './publicApiService';
export type { PublicCaddie } from './publicApiService';

// Caddie service (old mock)
export { caddieService } from './caddieService';
// Caddie API service (real - requires authentication)
export { caddieApiService } from './caddieApiService';

// List service (old mock)
export { listService } from './listService';
// List API service (real - requires authentication)
export { listApiService } from './listApiService';

// Schedule service (old mock)
export { scheduleService } from './scheduleService';
// Schedule API service (real - requires authentication)
export { scheduleApiService } from './scheduleApiService';

// Reports API service
export { reportsApiService } from './reportsApiService';

// WebSocket/Socket.IO service
export { socketService, webSocketService } from './socketService';
