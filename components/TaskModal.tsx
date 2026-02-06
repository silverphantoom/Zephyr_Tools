'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Task, Priority, Status, CATEGORIES } from '@/types';
import { formatDateISO } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  task?: Task | null;
  defaultStatus?: Status;
  defaultDate?: Date | null;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  task,
  defaultStatus = 'todo',
  defaultDate = null,
}: TaskModalProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(formatDateISO(task.dueDate));
        setCategory(task.category);
        setTags(task.tags.join(', '));
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus);
        setPriority('medium');
        setDueDate(defaultDate ? formatDateISO(defaultDate) : '');
        setCategory('General');
        setTags('');
      }
    }
  }, [isOpen, task, defaultStatus, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      projectId: null,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (isEditing && task && onUpdate) {
      onUpdate(task.id, taskData);
    } else {
      onSave(taskData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      if (confirm('Are you sure you want to delete this task?')) {
        onDelete(task.id);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Create Task'} size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Title"
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
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            options={statusOptions}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={priorityOptions}
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

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas"
        />

        <div className="flex items-center justify-between pt-4">
          {isEditing && onDelete ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
