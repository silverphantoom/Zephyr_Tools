import { NextResponse } from 'next/server';
import { 
  getCalendarClient, 
  findZephyrCalendar, 
  createCalendarEvent 
} from '@/lib/google-calendar';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, dueDate, priority } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and dueDate are required' },
        { status: 400 }
      );
    }

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

    const event = await createCalendarEvent(calendar, calendarId, {
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
