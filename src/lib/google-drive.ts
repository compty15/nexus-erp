import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_DRIVE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

/**
 * Initializes the Google Drive API client
 */
export async function getDriveClient() {
  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Ensures a folder exists, creating it if necessary
 */
export async function getOrCreateFolder(folderName: string, parentId?: string) {
  const drive = await getDriveClient();
  
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  
  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id;
  }
  
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : [],
  };
  
  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });
  
  return folder.data.id;
}

/**
 * Uploads a file to a specific folder in Google Drive
 */
export async function uploadToDrive(
  fileStream: any, 
  fileName: string, 
  mimeType: string, 
  folderId: string
) {
  const drive = await getDriveClient();
  
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  
  const media = {
    mimeType: mimeType,
    body: fileStream,
  };
  
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });
  
  return file.data;
}

/**
 * Generates a public thumbnail or view link for a drive file
 */
export async function getFileMetadata(fileId: string) {
  const drive = await getDriveClient();
  const response = await drive.files.get({
    fileId: fileId,
    fields: 'id, name, webViewLink, thumbnailLink, size',
  });
  return response.data;
}
