CREATE TABLE public.user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    colour_scheme JSONB DEFAULT '{
        "overdue": "bg-red-600",
        "lowPriority": "bg-green-200",
        "mediumPriority": "bg-yellow-200",
        "highPriority": "bg-red-200"
    }'
);
