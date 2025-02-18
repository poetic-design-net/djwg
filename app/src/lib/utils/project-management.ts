import type { TaskStatus } from '$lib/types/project-management';

export const STATUS_OPTIONS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

export const TASK_CATEGORIES = [
    'Feature',
    'Verbesserung',
    'Bug Fix',
    'Design',
    'Performance',
    'Dokumentation',
    'Sonstiges'
];

export const STATUS_COLORS = {
    backlog: 'bg-gray-100 text-gray-800',
    todo: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    review: 'bg-purple-100 text-purple-800',
    done: 'bg-green-100 text-green-800'
};

export const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800'
};

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getPriorityColor(priority: number): string {
    if (priority >= 80) return PRIORITY_COLORS.urgent;
    if (priority >= 60) return PRIORITY_COLORS.high;
    if (priority >= 40) return PRIORITY_COLORS.medium;
    return PRIORITY_COLORS.low;
}

export function getStatusColor(status: TaskStatus): string {
    return STATUS_COLORS[status] || STATUS_COLORS.backlog;
}

export function getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
        backlog: 'Backlog',
        todo: 'Zu erledigen',
        in_progress: 'In Bearbeitung',
        review: 'Review',
        done: 'Erledigt'
    };
    return labels[status] || status;
}

export const validateFormData = {
    required: (value: any) => {
        return value != null && value !== '';
    },
    minLength: (value: string, min: number) => {
        return value?.length >= min;
    },
    maxLength: (value: string, max: number) => {
        return value?.length <= max;
    },
    isNumber: (value: any) => {
        return !isNaN(Number(value));
    },
    isDate: (value: string) => {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
    }
};

export function generateUUID(): string {
    return crypto.randomUUID();
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}