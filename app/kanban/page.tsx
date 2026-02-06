'use client';

import { useState, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import {
  Plus,
  Calendar,
  Tag,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskModal } from '@/components/TaskModal';
import { CreateTaskFromEventModal } from '@/components/CreateTaskFromEventModal';
import { PriorityBadge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/use-tasks';
import { useGoogleCalendar, CalendarEvent } from '@/hooks/use-google-calendar';
import { formatDate, cn } from '@/lib/utils';
import { Task, Status } from '@/types';
import { format, isSameDay, isToday, isTomorrow } from 'date-fns';

const columns: { id: Status; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

interface KanbanTaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
}

function KanbanTaskCard({ task, index, onEdit }: KanbanTaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={cn(
            'bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing transition-all',
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-indigo-500/20 border-indigo-500 rotate-2'
              : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-[1.02]'
          )}
          style={provided.draggableProps.style}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'font-medium text-sm text-slate-900 dark:text-slate-100 flex-1',
              task.status === 'done' && 'line-through opacity-60'
            )}>
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <PriorityBadge priority={task.priority} />

            {task.dueDate && (
              <span className={cn(
                'flex items-center gap-1 text-xs',
                new Date(task.dueDate) < new Date() && task.status !== 'done'
                  ? 'text-red-500'
                  : 'text-slate-500'
              )}>
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-slate-400">+{task.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

interface KanbanColumnProps {
  column: typeof columns[0];
  tasks: Task[];
  onEdit: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

function KanbanColumn({ column, tasks, onEdit, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', column.color)} />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{column.title}</h3>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </CardHeader>

      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-3 space-y-3 min-h-[200px] rounded-xl transition-colors',
              snapshot.isDraggingOver
                ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-300 dark:border-indigo-700'
                : 'bg-slate-50/50 dark:bg-slate-900/30'
            )}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

interface CalendarEventMiniCardProps {
  event: CalendarEvent;
  onCreateTask: (event: CalendarEvent) => void;
}

function CalendarEventMiniCard({ event, onCreateTask }: CalendarEventMiniCardProps) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getTimeLabel = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    return format(event.startDate, 'h:mm a');
  };

  return (
    <div className="group p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
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
          )}>{getDateLabel(event.startDate)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{event.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{getTimeLabel(event)}</p>
        </div>

        <button
          onClick={() => onCreateTask(event)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all"
          title="Create task from event"
        >
          <Plus className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { tasks, createTask, updateTask, deleteTask, moveTask, isLoaded } = useTasks();
  const { 
    events, 
    isLoading: calendarLoading, 
    error: calendarError,
    getUpcomingEvents,
    refreshEvents,
  } = useGoogleCalendar();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  const tasksByColumn = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === 'todo'),
      'in-progress': tasks.filter((t) => t.status === 'in-progress'),
      done: tasks.filter((t) => t.status === 'done'),
    };
  }, [tasks]);

  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(8);
  }, [getUpcomingEvents]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Status;
    moveTask(draggableId, newStatus);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (status: Status) => {
    setDefaultStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCreateTaskFromEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Kanban Board</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Drag and drop tasks between columns</p>
            </div>
            <Button onClick={() => handleAddTask('todo')} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>

          <div className="flex gap-6 flex-1">
            {/* Kanban Board */}
            <div className="flex-1">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  {columns.map((column) => (
                    <Card key={column.id} className="flex flex-col h-full min-h-[500px]">
                      <KanbanColumn
                        column={column}
                        tasks={tasksByColumn[column.id]}
                        onEdit={handleEdit}
                        onAddTask={handleAddTask}
                      />
                    </Card>
                  ))}
                </div>
              </DragDropContext>
            </div>

            {/* Calendar Events Sidebar */}
            <div className="w-72 flex-shrink-0">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Calendar Events</h3>
                    </div>
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
                  <p className="text-xs text-slate-500 mt-1">Create tasks from upcoming events</p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {calendarLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <CalendarEventMiniCard
                          key={event.id}
                          event={event}
                          onCreateTask={handleCreateTaskFromEvent}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={createTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
        task={editingTask}
        defaultStatus={defaultStatus}
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
