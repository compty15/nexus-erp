/**
 * NEXUS ERP: Google Drive Refresh Token Generator
 * 
 * Instructions:
 * 1. Ensure GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET are in your .env
 * 2. Run: node scripts/get-refresh-token.mjs
 * 3. Follow the console instructions.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: Missing Client ID or Secret in .env file.');
  process.exit(1);
}

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Force consent screen to ensure refresh token is returned
});

console.log('--- NEXUS GOOGLE DRIVE SETUP ---');
console.log('1. Open this URL in your browser:');
console.log('\x1b[36m%s\x1b[0m', authUrl);
console.log('\n2. After authorizing, you will be redirected to a URL like:');
console.log('   http://localhost:3000/api/auth/callback/google?code=4/0AfgeX...');
console.log('\n3. Copy the "code" parameter from that URL and paste it here:');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n--- SUCCESS ---');
    console.log('Add this to your .env file:');
    console.log('\x1b[32m%s\x1b[0m', `GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
  } catch (err) {
    console.error('Error retrieving access token:', err.message);
  } finally {
    rl.close();
  }
});
