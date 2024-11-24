import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);
    let nextId = 1;

    const addToast = (message: string, type: ToastType = 'info') => {
        const toast: Toast = {
            id: nextId++,
            message,
            type,
        };

        update(toasts => [...toasts, toast]);

        // Auto-remove toast after 3 seconds
        setTimeout(() => {
            removeToast(toast.id);
        }, 3000);
    };

    const removeToast = (id: number) => {
        update(toasts => toasts.filter(t => t.id !== id));
    };

    return {
        subscribe,
        add: addToast,
        remove: removeToast,
        success: (message: string) => addToast(message, 'success'),
        error: (message: string) => addToast(message, 'error'),
        info: (message: string) => addToast(message, 'info'),
    };
}

export const toasts = createToastStore();
