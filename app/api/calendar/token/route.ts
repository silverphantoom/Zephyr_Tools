import { NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// Service account credentials from environment variable
const getCredentials = () => {
  try {
    const credsJson = process.env.GOOGLE_CALENDAR_CREDENTIALS;
    if (credsJson) {
      return JSON.parse(credsJson);
    }
    
    // Fallback to individual env vars
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  } catch (error) {
    console.error('Error parsing credentials:', error);
    return null;
  }
};

export async function GET() {
  try {
    const credentials = getCredentials();
    
    if (!credentials?.client_email || !credentials?.private_key) {
      return NextResponse.json(
        { error: 'Google Calendar credentials not configured' },
        { status: 500 }
      );
    }

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    // Get access token
    const accessToken = await auth.getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to obtain access token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500 }
    );
  }
}
