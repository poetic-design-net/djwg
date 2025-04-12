export interface ErrorLog {
    id: string;
    created_at: string;
    event_type: string;
    message: string;
    details?: Record<string, any>;
}

export type ErrorLogEventType = 'newsletter_sync' | 'system' | 'user_action';