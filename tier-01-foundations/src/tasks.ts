import { Router } from 'express';

export type Task = {
  id: number;
  title: string;
  done: boolean;
};

const tasks: Task[] = [];
let nextId = 1;

function findTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === Number(id));
}

export const tasksRouter = Router();

tasksRouter.get('/', (_req, res) => {
  res.json(tasks);
});

tasksRouter.get('/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

tasksRouter.post('/', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const task: Task = { id: nextId++, title, done: false };
  tasks.push(task);

  res.status(201).location(`/tasks/${task.id}`).json(task);
});

// PUT replaces the whole task: every field is required.
tasksRouter.put('/:id', (req, res) => {
  const { title, done } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '' || typeof done !== 'boolean') {
    res.status(400).json({ error: 'title (non-empty string) and done (boolean) are required' });
    return;
  }

  const task = findTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  task.title = title;
  task.done = done;
  res.json(task);
});

// PATCH changes only the fields that were sent.
tasksRouter.patch('/:id', (req, res) => {
  const { title, done } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    res.status(400).json({ error: 'title must be a non-empty string' });
    return;
  }
  if (done !== undefined && typeof done !== 'boolean') {
    res.status(400).json({ error: 'done must be a boolean' });
    return;
  }

  const task = findTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  res.json(task);
});

tasksRouter.delete('/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  tasks.splice(index, 1);
  res.status(204).end();
});
