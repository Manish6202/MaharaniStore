// Google Sign-In Configuration
// Use environment variables for sensitive data
// Set GOOGLE_WEB_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file

import { GOOGLE_WEB_CLIENT_ID as ENV_CLIENT_ID, GOOGLE_CLIENT_SECRET as ENV_CLIENT_SECRET } from '@env';

// These values should be set in .env file
// For development, create App/.env file with:
// GOOGLE_WEB_CLIENT_ID=your-client-id
// GOOGLE_CLIENT_SECRET=your-client-secret
export const GOOGLE_WEB_CLIENT_ID = ENV_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = ENV_CLIENT_SECRET || '';

// Official Google Icon URL
export const GOOGLE_ICON_URL = 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg';

