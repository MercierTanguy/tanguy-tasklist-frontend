import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
    it('renders create form by default', () => {
        render(<TaskForm onSubmit={vi.fn()} />);
        expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
        expect(screen.getByText('Ajouter')).toBeInTheDocument();
    });

    it('renders edit form when mode is edit', () => {
        render(<TaskForm onSubmit={vi.fn()} mode="edit" />);
        expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
        expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    it('renders with initial values', () => {
        render(
            <TaskForm
                onSubmit={vi.fn()}
                initialValues={{ title: 'Mon titre', description: 'Ma description' }}
            />
        );
        expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Ma description')).toBeInTheDocument();
    });

    it('calls onSubmit with form data when submitted', async () => {
        const onSubmit = vi.fn();
        const user = userEvent.setup();
        render(<TaskForm onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText('Titre'), 'Nouvelle tâche');
        await user.type(screen.getByLabelText('Description'), 'Ma description');
        await user.click(screen.getByText('Ajouter'));

        expect(onSubmit).toHaveBeenCalledWith({
            title: 'Nouvelle tâche',
            description: 'Ma description',
        });
    }, 15000);

    it('calls onSubmit without description when empty', async () => {
        const onSubmit = vi.fn();
        const user = userEvent.setup();
        render(<TaskForm onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText('Titre'), 'Tâche sans description');
        await user.click(screen.getByText('Ajouter'));

        expect(onSubmit).toHaveBeenCalledWith({
            title: 'Tâche sans description',
            description: undefined,
        });
    }, 15000);

    it('shows validation error when title is empty', async () => {
        render(<TaskForm onSubmit={vi.fn()} />);
        await userEvent.click(screen.getByText('Ajouter'));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
    });

    it('clears validation error when user types', async () => {
        render(<TaskForm onSubmit={vi.fn()} />);
        await userEvent.click(screen.getByText('Ajouter'));
        expect(screen.getByText('Le titre est requis')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Titre'), 'A');
        expect(screen.queryByText('Le titre est requis')).not.toBeInTheDocument();
    });

    it('resets form after successful create submission', async () => {
        const onSubmit = vi.fn();
        const user = userEvent.setup();
        render(<TaskForm onSubmit={onSubmit} />);

        await user.type(screen.getByLabelText('Titre'), 'Tâche test');
        await user.click(screen.getByText('Ajouter'));

        expect(screen.getByLabelText('Titre')).toHaveValue('');
    }, 15000);

    it('does not reset form after edit submission', async () => {
        const onSubmit = vi.fn();
        render(
            <TaskForm
                onSubmit={onSubmit}
                mode="edit"
                initialValues={{ title: 'Titre existant' }}
            />
        );

        await userEvent.click(screen.getByText('Modifier'));

        expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');
    });

    it('shows cancel button when onCancel provided', () => {
        render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText('Annuler')).toBeInTheDocument();
    });

    it('calls onCancel when cancel button clicked', async () => {
        const onCancel = vi.fn();
        render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
        await userEvent.click(screen.getByText('Annuler'));
        expect(onCancel).toHaveBeenCalled();
    });

    it('does not show cancel button when onCancel not provided', () => {
        render(<TaskForm onSubmit={vi.fn()} />);
        expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
    });
});