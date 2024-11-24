import { writable } from 'svelte/store';

interface AuthState {
    previousAuthState: boolean | null;
    currentAuthState: boolean | null;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        previousAuthState: null,
        currentAuthState: null
    });

    return {
        subscribe,
        updateAuthState: (isAuthenticated: boolean) => {
            update(state => ({
                previousAuthState: state.currentAuthState,
                currentAuthState: isAuthenticated
            }));
        },
        reset: () => set({ previousAuthState: null, currentAuthState: null })
    };
}

export const authState = createAuthStore();
