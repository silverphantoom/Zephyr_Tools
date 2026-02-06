'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Task, Priority, Status, CATEGORIES } from '@/types';
import { formatDateISO } from '@/lib/utils';
import { CalendarEvent } from '@/hooks/use-google-calendar';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface CreateTaskFromEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  event: CalendarEvent | null;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function CreateTaskFromEventModal({
  isOpen,
  onClose,
  onSave,
  event,
}: CreateTaskFromEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [syncToCalendar, setSyncToCalendar] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setPriority('medium');
      setDueDate(formatDateISO(event.startDate.toISOString()));
      setCategory('General');
      setTags('');
      setSyncToCalendar(false);
    }
  }, [isOpen, event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status: 'todo' as Status,
      priority,
      dueDate: dueDate || null,
      projectId: null,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onSave(taskData);
    onClose();
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Task from Event" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Event Info Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{event.title}</h4>
          {event.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(event.startDate, 'EEEE, MMMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.isAllDay ? 'All day' : format(event.startDate, 'h:mm a')}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
          </div>
        </div>

        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={priorityOptions}
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Task
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
