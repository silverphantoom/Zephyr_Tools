import { JWT } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import { addDays, format, parseISO } from 'date-fns';

// Service account credentials
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
      project_id: process.env.GOOGLE_PROJECT_ID,
    };
  } catch (error) {
    console.error('Error parsing credentials:', error);
    return null;
  }
};

// Initialize Google Calendar API
export async function getCalendarClient(): Promise<calendar_v3.Calendar | null> {
  const credentials = getCredentials();
  
  if (!credentials?.client_email || !credentials?.private_key) {
    console.error('Google Calendar credentials not configured');
    return null;
  }

  try {
    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth: auth as any });
    return calendar;
  } catch (error) {
    console.error('Error initializing calendar client:', error);
    return null;
  }
}

// Find Zephyr calendar
export async function findZephyrCalendar(calendar: calendar_v3.Calendar): Promise<string | null> {
  try {
    const response = await calendar.calendarList.list();
    const calendars = response.data.items || [];
    
    const zephyrCalendar = calendars.find(cal => cal.summary === 'Zephyr');
    return zephyrCalendar?.id || null;
  } catch (error) {
    console.error('Error finding Zephyr calendar:', error);
    return null;
  }
}

// Fetch events from Zephyr calendar
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  htmlLink: string;
  isAllDay: boolean;
}

export async function fetchCalendarEvents(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  daysAhead: number = 30
): Promise<CalendarEvent[]> {
  try {
    const timeMin = new Date().toISOString();
    const timeMax = addDays(new Date(), daysAhead).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    });

    const events = response.data.items || [];

    return events.map(event => {
      const isAllDay = !!event.start?.date;
      const startDate = event.start?.dateTime 
        ? new Date(event.start.dateTime)
        : new Date(event.start?.date || new Date());
      const endDate = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : new Date(event.end?.date || new Date());

      return {
        id: event.id || '',
        title: event.summary || 'Untitled Event',
        description: event.description || undefined,
        startDate,
        endDate,
        location: event.location || undefined,
        htmlLink: event.htmlLink || '',
        isAllDay,
      };
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

// Create a calendar event from a task
export async function createCalendarEvent(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  task: {
    title: string;
    description?: string;
    dueDate: Date;
    priority?: string;
  }
): Promise<calendar_v3.Schema$Event | null> {
  try {
    const event: calendar_v3.Schema$Event = {
      summary: `[Task] ${task.title}`,
      description: task.description || `Priority: ${task.priority || 'medium'}`,
      start: {
        dateTime: task.dueDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(task.dueDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour default
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}
