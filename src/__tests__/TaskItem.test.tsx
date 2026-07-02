import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test description',
    completed: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
    it('renders task title and description', () => {
        render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders without description when null', () => {
        render(
            <TaskItem
                task={{ ...mockTask, description: null }}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn()}
            />
        );
        expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('calls onToggle when checkbox is clicked', () => {
        const onToggle = vi.fn();
        render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);

        fireEvent.click(screen.getByRole('checkbox'));
        expect(onToggle).toHaveBeenCalledWith(1);
    });

    it('shows edit form when edit button is clicked', () => {
        render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

        fireEvent.click(screen.getByLabelText('Modifier'));
        expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
        expect(screen.getByText('Enregistrer')).toBeInTheDocument();
    });

    it('calls onEdit when save is clicked', () => {
        const onEdit = vi.fn();
        render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);

        fireEvent.click(screen.getByLabelText('Modifier'));
        fireEvent.change(screen.getByLabelText('Modifier le titre'), {
            target: { value: 'Titre modifié' },
        });
        fireEvent.click(screen.getByText('Enregistrer'));

        expect(onEdit).toHaveBeenCalledWith(1, {
            title: 'Titre modifié',
            description: 'Test description',
        });
    });

    it('cancels edit and restores original values', () => {
        render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);

        fireEvent.click(screen.getByLabelText('Modifier'));
        fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Changé' } });
        fireEvent.click(screen.getByText('Annuler'));

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
    });

    it('calls onDelete on second delete click', () => {
        const onDelete = vi.fn();
        render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);

        fireEvent.click(screen.getByLabelText('Supprimer'));
        fireEvent.click(screen.getByLabelText('Supprimer'));

        expect(onDelete).toHaveBeenCalledWith(1);
    });

    it('has completed class when task is completed', () => {
        render(
            <TaskItem
                task={{ ...mockTask, completed: true }}
                onToggle={vi.fn()}
                onDelete={vi.fn()}
                onEdit={vi.fn()}
            />
        );
        expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
    });
});