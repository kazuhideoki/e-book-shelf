import { google } from 'googleapis';

export const getAuthUrl = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_CLIENT_ID,
    process.env.GOOGLE_DRIVE_API_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_WEB_FRONT_URL,
  );

  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/cloud-platform',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};