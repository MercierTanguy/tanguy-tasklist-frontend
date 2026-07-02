import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTasks throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error'),
			})
		);

		await expect(getTasks()).rejects.toThrow('HTTP 500');
	});

	it('getTask returns single task', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			})
		);

		const task = await getTask(1);
		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('getTask throws on 404', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(getTask(99)).rejects.toThrow('HTTP 404');
	});

	it('createTask sends POST and returns created task', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			})
		);

		const task = await createTask({ title: 'Test', description: 'Desc' });
		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		}));
	});

	it('createTask throws on error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad request'),
			})
		);

		await expect(createTask({ title: '' })).rejects.toThrow('HTTP 400');
	});

	it('updateTask sends PUT and returns updated task', async () => {
		const updatedTask = { ...mockTask, title: 'Updated', completed: true };
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(updatedTask),
			})
		);

		const task = await updateTask(1, { title: 'Updated', completed: true });
		expect(task).toEqual(updatedTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
			method: 'PUT',
		}));
	});

	it('updateTask throws on error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(updateTask(99, { title: 'Updated' })).rejects.toThrow('HTTP 404');
	});

	it('deleteTask sends DELETE request', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
			})
		);

		await deleteTask(1);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
			method: 'DELETE',
		}));
	});

	it('deleteTask throws on error', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(deleteTask(99)).rejects.toThrow('HTTP 404');
	});
});