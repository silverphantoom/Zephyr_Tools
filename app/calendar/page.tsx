'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isTomorrow,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskModal } from '@/components/TaskModal';
import { CreateTaskFromEventModal } from '@/components/CreateTaskFromEventModal';
import { PriorityBadge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/use-tasks';
import { useGoogleCalendar, CalendarEvent } from '@/hooks/use-google-calendar';
import { cn } from '@/lib/utils';
import { Task, Status } from '@/types';

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const { tasks, createTask, updateTask, isLoaded } = useTasks();
  const { 
    events, 
    isLoading: calendarLoading, 
    error: calendarError,
    getEventsForDay,
    refreshEvents,
  } = useGoogleCalendar();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const calendarDays = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      const days: Date[] = [];
      let day = calendarStart;
      while (day <= calendarEnd) {
        days.push(day);
        day = addDays(day, 1);
      }
      return days;
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }
      return days;
    } else {
      return [currentDate];
    }
  }, [currentDate, view]);

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setSelectedDate(new Date(task.dueDate || new Date()));
    setIsModalOpen(true);
  };

  const handleDragStart = (task: Task) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData('taskId', task.id);
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
        updateTask(taskId, { dueDate: date.toISOString() });
      }
    };
  };

  const handleCreateTaskFromEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Calendar</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">View tasks and events side by side</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                {(['month', 'week', 'day'] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                      view === v
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    )}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 font-medium min-w-[140px] text-center]">
                    {view === 'month' && format(currentDate, 'MMMM yyyy')}
                    {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
                    {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
                  </span>
                  <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-6">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <Card>
                <CardContent className="p-0">
                  {view === 'month' && (
                    <div>
                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                        {weekDays.map((day) => (
                          <div
                            key={day}
                            className="py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-400"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 auto-rows-fr">
                        {calendarDays.map((date, index) => {
                          const dayTasks = getTasksForDay(date);
                          const dayEvents = getEventsForDay(date);
                          const isCurrentMonth = isSameMonth(date, currentDate);
                          const isTodayDate = isToday(date);

                          return (
                            <motion.div
                              key={date.toISOString()}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.01 }}
                              onClick={() => handleDateClick(date)}
                              onDragOver={handleDragOver}
                              onDrop={handleDrop(date)}
                              className={cn(
                                'min-h-[120px] p-2 border-b border-r border-slate-200 dark:border-slate-800 cursor-pointer transition-colors',
                                !isCurrentMonth && 'bg-slate-50 dark:bg-slate-900/50',
                                isTodayDate && 'bg-indigo-50/50 dark:bg-indigo-900/10'
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={cn(
                                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                                    isTodayDate
                                      ? 'bg-indigo-600 text-white'
                                      : isCurrentMonth
                                      ? 'text-slate-700 dark:text-slate-300'
                                      : 'text-slate-400 dark:text-slate-600'
                                  )}
                                >
                                  {format(date, 'd')}
                                </span>
                                <div className="flex items-center gap-1">
                                  {dayEvents.length > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {dayTasks.length > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                {/* Calendar Events */}
                                {dayEvents.slice(0, 2).map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCreateTaskFromEvent(event);
                                    }}
                                    className="w-full text-left text-xs px-2 py-1 rounded truncate bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                  >
                                    📅 {event.title}
                                  </button>
                                ))}
                                
                                {/* Tasks */}
                                {dayTasks.slice(0, dayEvents.length > 0 ? 1 : 3).map((task) => (
                                  <div
                                    key={task.id}
                                    draggable
                                    onDragStart={handleDragStart(task)}
                                    onClick={(e) => handleTaskClick(task, e)}
                                    className={cn(
                                      'text-xs px-2 py-1 rounded truncate cursor-move transition-all hover:shadow-md',
                                      task.status === 'done' && 'opacity-50 line-through',
                                      task.priority === 'urgent' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                                      task.priority === 'high' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                                      task.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                                      task.priority === 'low' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    )}
                                  >
                                    {task.title}
                                  </div>
                                ))}
                                
                                {dayTasks.length + dayEvents.length > 3 && (
                                  <div className="text-xs text-slate-500 px-2">
                                    +{dayTasks.length + dayEvents.length - 3} more
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {view === 'week' && (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {calendarDays.map((date) => {
                        const dayTasks = getTasksForDay(date);
                        const dayEvents = getEventsForDay(date);
                        const isTodayDate = isToday(date);

                        return (
                          <div
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop(date)}
                            className={cn(
                              'p-4 flex gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                              isTodayDate && 'bg-indigo-50/30 dark:bg-indigo-900/10'
                            )}
                          >
                            <div className="w-20 flex-shrink-0">
                              <p className={cn(
                                'font-medium',
                                isTodayDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'
                              )}>
                                {format(date, 'EEE')}
                              </p>
                              <p className={cn(
                                'text-2xl font-bold',
                                isTodayDate ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                              )}>
                                {format(date, 'd')}
                              </p>
                            </div>

                            <div className="flex-1 space-y-2">
                              {/* Calendar Events */}
                              {dayEvents.map((event) => (
                                <button
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateTaskFromEvent(event);
                                  }}
                                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    <span className="text-lg">📅</span>
                                    <span className="flex-1 text-left font-medium text-indigo-900 dark:text-indigo-100">
                                      {event.title}
                                    </span>
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                                      {event.isAllDay ? 'All day' : format(event.startDate, 'h:mm a')}
                                    </span>
                                </button>
                              ))}
                              
                              {/* Tasks */}
                              {dayTasks.map((task) => (
                                <div
                                  key={task.id}
                                  draggable
                                  onDragStart={handleDragStart(task)}
                                  onClick={(e) => handleTaskClick(task, e)}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all hover:shadow-md',
                                    task.status === 'done'
                                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                  )}
                                >
                                  <PriorityBadge priority={task.priority} />
                                  <span className={cn(
                                    'flex-1',
                                    task.status === 'done' && 'line-through text-slate-400'
                                  )}>
                                    {task.title}
                                  </span>
                                  {task.status === 'done' && (
                                    <span className="text-xs text-emerald-600">Completed</span>
                                  )}
                                </div>
                              ))}
                              
                              {dayTasks.length === 0 && dayEvents.length === 0 && (
                                <p className="text-slate-400 text-sm py-2">No tasks or events</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {view === 'day' && (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                          {format(currentDate, 'EEEE, MMMM d, yyyy')}
                          {isToday(currentDate) && (
                            <span className="ml-2 text-sm font-normal px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                              Today
                            </span>
                          )}
                        </h2>
                        <Button onClick={() => handleDateClick(currentDate)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Task
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {/* Calendar Events */}
                        {getEventsForDay(currentDate).length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Calendar Events
                            </h3>
                            <div className="space-y-2">
                              {getEventsForDay(currentDate).map((event, idx) => (
                                <button
                                  key={event.id}
                                  onClick={() => handleCreateTaskFromEvent(event)}
                                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-left"
                                >
                                  <div className="w-16 text-center">
                                    <Clock className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                                    <span className="text-xs text-indigo-600">
                                      {event.isAllDay ? 'All day' : format(event.startDate, 'h:mm a')}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100">{event.title}</h4>
                                    {event.description && (
                                      <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">{event.description}</p>
                                    )}
                                  </div>
                                  <Plus className="w-5 h-5 text-indigo-500" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tasks */}
                        <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Tasks
                        </h3>
                        
                        {getTasksForDay(currentDate).length === 0 ? (
                          <div className="text-center py-8">
                            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No tasks scheduled for this day</p>
                            <Button
                              variant="ghost"
                              onClick={() => handleDateClick(currentDate)}
                              className="mt-2"
                            >
                              Add a task
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {getTasksForDay(currentDate).map((task, idx) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={handleDragStart(task)}
                                onClick={(e) => handleTaskClick(task, e)}
                                className={cn(
                                  'flex items-center gap-4 p-4 rounded-xl border cursor-move transition-all hover:shadow-lg',
                                  task.status === 'done'
                                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                )}
                                style={{ animationDelay: `${idx * 50}ms` }}
                              >
                                <div className="w-16 text-center">
                                  <Clock className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                                  <span className="text-xs text-slate-500">{task.dueDate ? format(new Date(task.dueDate), 'h:mm a') : 'No time'}</span>
                                </div>
                                <div className="flex-1">
                                  <h3 className={cn(
                                    'font-medium',
                                    task.status === 'done' && 'line-through text-slate-400'
                                  )}>
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                  )}
                                </div>
                                <PriorityBadge priority={task.priority} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar with Calendar Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-80 flex-shrink-0"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-500" />
                      Zephyr Events
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {calendarError && (
                        <span className="text-xs text-amber-500" title={calendarError}>Demo</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshEvents}
                        disabled={calendarLoading}
                        className="p-1 h-auto"
                      >
                        <RefreshCw className={`w-4 h-4 ${calendarLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Upcoming calendar events</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {calendarLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.slice(0, 10).map((event) => (
                        <div
                          key={event.id}
                          className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs flex-shrink-0",
                              isToday(event.startDate) && "bg-indigo-100 dark:bg-indigo-900/30",
                              isTomorrow(event.startDate) && "bg-amber-100 dark:bg-amber-900/30",
                              !isToday(event.startDate) && !isTomorrow(event.startDate) && "bg-slate-100 dark:bg-slate-700"
                            )}>
                              <span className={cn(
                                "font-medium",
                                isToday(event.startDate) && "text-indigo-600 dark:text-indigo-400",
                                isTomorrow(event.startDate) && "text-amber-600 dark:text-amber-400",
                                !isToday(event.startDate) && !isTomorrow(event.startDate) && "text-slate-600 dark:text-slate-400"
                              )}>
                                {format(event.startDate, 'MMM')}
                              </span>
                              <span className="text-lg font-bold">{format(event.startDate, 'd')}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{event.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {event.isAllDay ? 'All day' : format(event.startDate, 'h:mm a')}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                              onClick={() => handleCreateTaskFromEvent(event)}
                            >
                              <Plus className="w-3 h-3" />
                              Create Task
                            </Button>
                            
                            {event.htmlLink && event.htmlLink !== '#' && (
                              <a
                                href={event.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={createTask}
        onUpdate={updateTask}
        task={selectedTask}
        defaultStatus="todo"
        defaultDate={selectedDate}
      />

      <CreateTaskFromEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={createTask}
        event={selectedEvent}
      />
    </div>
  );
}
