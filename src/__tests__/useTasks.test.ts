import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

vi.mock('../api/taskApi');

const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Description',
    completed: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
};

const mockTaskApi = vi.mocked(taskApi);

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useTasks', () => {
    it('loads tasks on mount', async () => {
        mockTaskApi.getTasks.mockResolvedValue([mockTask]);

        const { result } = renderHook(() => useTasks());

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.tasks).toEqual([mockTask]);
        expect(result.current.error).toBeNull();
    });

    it('sets error when loadTasks fails', async () => {
        mockTaskApi.getTasks.mockRejectedValue(new Error('Erreur réseau'));

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(result.current.error).toBe('Erreur réseau');
        expect(result.current.tasks).toEqual([]);
    });

    it('adds task with addTask', async () => {
        mockTaskApi.getTasks.mockResolvedValue([]);
        mockTaskApi.createTask.mockResolvedValue(mockTask);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        await act(async () => {
            await result.current.addTask({ title: 'Test Task' });
        });

        expect(result.current.tasks).toContainEqual(mockTask);
    });

    it('edits task with editTask', async () => {
        const updatedTask = { ...mockTask, title: 'Updated' };
        mockTaskApi.getTasks.mockResolvedValue([mockTask]);
        mockTaskApi.updateTask.mockResolvedValue(updatedTask);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        await act(async () => {
            await result.current.editTask(1, { title: 'Updated' });
        });

        expect(result.current.tasks[0].title).toBe('Updated');
    });

    it('removes task with removeTask', async () => {
        mockTaskApi.getTasks.mockResolvedValue([mockTask]);
        mockTaskApi.deleteTask.mockResolvedValue(undefined);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        await act(async () => {
            await result.current.removeTask(1);
        });

        expect(result.current.tasks).toEqual([]);
    });

    it('toggles task completion with toggleComplete', async () => {
        const toggledTask = { ...mockTask, completed: true };
        mockTaskApi.getTasks.mockResolvedValue([mockTask]);
        mockTaskApi.updateTask.mockResolvedValue(toggledTask);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        await act(async () => {
            await result.current.toggleComplete(1);
        });

        expect(result.current.tasks[0].completed).toBe(true);
    });

    it('toggleComplete does nothing when task not found', async () => {
        mockTaskApi.getTasks.mockResolvedValue([mockTask]);

        const { result } = renderHook(() => useTasks());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        await act(async () => {
            await result.current.toggleComplete(99);
        });

        expect(mockTaskApi.updateTask).not.toHaveBeenCalled();
    });
});