'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, Project, Status, Priority } from '@/types';
import { generateId } from '@/lib/utils';

const TASKS_STORAGE_KEY = 'pm-app-tasks';
const PROJECTS_STORAGE_KEY = 'pm-app-projects';
const SYNCED_TASKS_KEY = 'pm-app-synced-tasks';

// Sample initial data
const sampleProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    color: '#6366f1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'project-2',
    name: 'Mobile App',
    description: 'iOS and Android mobile application',
    color: '#10b981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create initial design concepts for the new homepage',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    projectId: 'project-1',
    category: 'Design',
    tags: ['ui', 'homepage'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'task-2',
    title: 'Setup project repository',
    description: 'Initialize Git repo and configure CI/CD',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    projectId: 'project-2',
    category: 'Development',
    tags: ['devops', 'setup'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'User research interviews',
    description: 'Conduct interviews with 5 target users',
    status: 'todo',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    projectId: 'project-1',
    category: 'Research',
    tags: ['research', 'users'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: 'task-4',
    title: 'API documentation',
    description: 'Document all REST API endpoints',
    status: 'todo',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    projectId: 'project-2',
    category: 'Documentation',
    tags: ['docs', 'api'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(sampleTasks);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(sampleTasks));
      }
      
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        setProjects(sampleProjects);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sampleProjects));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setTasks(sampleTasks);
      setProjects(sampleProjects);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }, [projects, isLoaded]);

  // Sync task to calendar
  const syncTaskToCalendar = useCallback(async (task: Task): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
        }),
      });

      if (response.ok) {
        // Mark task as synced
        const syncedTasks = JSON.parse(localStorage.getItem(SYNCED_TASKS_KEY) || '[]');
        if (!syncedTasks.includes(task.id)) {
          syncedTasks.push(task.id);
          localStorage.setItem(SYNCED_TASKS_KEY, JSON.stringify(syncedTasks));
        }
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error syncing task to calendar:', err);
      return false;
    }
  }, []);

  // Check if a task is synced
  const isTaskSynced = useCallback((taskId: string): boolean => {
    const syncedTasks = JSON.parse(localStorage.getItem(SYNCED_TASKS_KEY) || '[]');
    return syncedTasks.includes(taskId);
  }, []);

  // Task operations
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: taskData.status === 'done' ? new Date().toISOString() : null,
    };
    setTasks((prev) => [newTask, ...prev]);
    
    // Auto-sync to calendar if due date is set
    if (newTask.dueDate) {
      syncTaskToCalendar(newTask);
    }
    
    return newTask;
  }, [syncTaskToCalendar]);

  const updateTask = useCallback((id: string, updates: Partial<Task>): Task | null => {
    let updatedTask: Task | null = null;
    let shouldSync = false;
    
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const isCompleting = updates.status === 'done' && task.status !== 'done';
          const isReopening = updates.status && updates.status !== 'done' && task.status === 'done';
          const isDueDateChanged = updates.dueDate && updates.dueDate !== task.dueDate;
          
          // Sync if due date changes
          if (isDueDateChanged) {
            shouldSync = true;
          }
          
          const newTask: Task = {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString(),
            completedAt: isCompleting 
              ? new Date().toISOString() 
              : isReopening 
                ? null 
                : task.completedAt,
          };
          updatedTask = newTask;
          return newTask;
        }
        return task;
      })
    );
    
    // Sync to calendar if due date was updated
    if (updatedTask && shouldSync && (updatedTask as Task).dueDate) {
      syncTaskToCalendar(updatedTask as Task);
    }
    
    return updatedTask;
  }, [syncTaskToCalendar]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    
    // Remove from synced tasks
    const syncedTasks = JSON.parse(localStorage.getItem(SYNCED_TASKS_KEY) || '[]');
    const updatedSynced = syncedTasks.filter((taskId: string) => taskId !== id);
    localStorage.setItem(SYNCED_TASKS_KEY, JSON.stringify(updatedSynced));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: Status) => {
    updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  // Project operations
  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>): Project | null => {
    let updatedProject: Project | null = null;
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === id) {
          updatedProject = {
            ...project,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          return updatedProject;
        }
        return project;
      })
    );
    return updatedProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    // Also remove projectId from tasks
    setTasks((prev) =>
      prev.map((task) =>
        task.projectId === id ? { ...task, projectId: null, updatedAt: new Date().toISOString() } : task
      )
    );
  }, []);

  // Statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  return {
    tasks,
    projects,
    isLoaded,
    stats,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createProject,
    updateProject,
    deleteProject,
    syncTaskToCalendar,
    isTaskSynced,
  };
}
