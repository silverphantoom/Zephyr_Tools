import { NextResponse } from 'next/server';
import { 
  getCalendarClient, 
  findZephyrCalendar, 
  fetchCalendarEvents 
} from '@/lib/google-calendar';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('days') || '30', 10);

    const calendar = await getCalendarClient();
    
    if (!calendar) {
      return NextResponse.json(
        { error: 'Calendar client not initialized' },
        { status: 500 }
      );
    }

    const calendarId = await findZephyrCalendar(calendar);
    
    if (!calendarId) {
      return NextResponse.json(
        { error: 'Zephyr calendar not found' },
        { status: 404 }
      );
    }

    const events = await fetchCalendarEvents(calendar, calendarId, daysAhead);

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
