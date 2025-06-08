-- Ensure "tasks" table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        CREATE TABLE public.tasks (
            due_date DATE,
            title VARCHAR(255) NOT NULL,
            id SERIAL PRIMARY KEY,
            category_id INTEGER,
            updated_at TIMESTAMP DEFAULT now(),
            repeat_interval INTERVAL,
            importance_factor INTEGER,
            completed BOOLEAN DEFAULT false,
            repeated BOOLEAN DEFAULT false,
            is_deleted BOOLEAN DEFAULT false,
            notes TEXT,
            completed_at TIMESTAMP,
            user_id INTEGER NOT NULL,
            duration INTEGER,
            created_at TIMESTAMP DEFAULT now(),
            description TEXT
        );
    END IF;
END $$;

-- Ensure "users" table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        CREATE TABLE public.users (
            firebase_uid VARCHAR(255),
            username VARCHAR(255) NOT NULL,
            is_verified BOOLEAN DEFAULT false,
            email VARCHAR(255) NOT NULL,
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now()
        );
    END IF;
END $$;

-- Ensure "task_notes" table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_notes') THEN
        CREATE TABLE public.task_notes (
            task_id INTEGER NOT NULL,
            note TEXT,
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now()
        );
    END IF;
END $$;

-- Ensure "categories" table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        CREATE TABLE public.categories (
            name VARCHAR(255) NOT NULL,
            id SERIAL PRIMARY KEY,
            is_default BOOLEAN DEFAULT false,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT now()
        );
    END IF;
END $$;

-- Ensure "user_settings" table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
        CREATE TABLE public.user_settings (
            user_id INTEGER NOT NULL PRIMARY KEY,
            colour_scheme JSONB DEFAULT '{"overdue": "bg-red-600", "lowPriority": "bg-green-200", "highPriority": "bg-red-200", "mediumPriority": "bg-yellow-200"}'::jsonb,
            notifications_enabled BOOLEAN DEFAULT true,
            theme TEXT DEFAULT 'light'
        );
    END IF;
END $$;

-- Ensure foreign keys exist for "tasks" table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'tasks' AND constraint_name = 'tasks_user_id_fkey') THEN
        ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'tasks' AND constraint_name = 'tasks_category_id_fkey') THEN
        ALTER TABLE public.tasks ADD CONSTRAINT tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
END $$;

-- Ensure foreign key exists for "task_notes" table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'task_notes' AND constraint_name = 'task_notes_task_id_fkey') THEN
        ALTER TABLE public.task_notes ADD CONSTRAINT task_notes_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);
    END IF;
END $$;

-- Ensure foreign key exists for "categories" table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'categories' AND constraint_name = 'categories_user_id_fkey') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
    END IF;
END $$;

-- Ensure foreign key exists for "user_settings" table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_schema = 'public' AND table_name = 'user_settings' AND constraint_name = 'user_settings_user_id_fkey') THEN
        ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
    END IF;
END $$;


-- Ensure "tasks" table matches the required structure
ALTER TABLE tasks 
    ADD COLUMN IF NOT EXISTS due_date DATE,
    ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS category_id INTEGER,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now(),
    ADD COLUMN IF NOT EXISTS repeat_interval INTERVAL,
    ADD COLUMN IF NOT EXISTS importance_factor INTEGER,
    ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS repeated BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL,
    ADD COLUMN IF NOT EXISTS duration INTEGER,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now(),
    ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure foreign keys exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='tasks' AND constraint_name='tasks_user_id_fkey') THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='tasks' AND constraint_name='tasks_category_id_fkey') THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);
    END IF;
END $$;


-- Ensure "users" table matches the required structure
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255),
    ADD COLUMN IF NOT EXISTS username VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

-- Ensure unique constraint on firebase_uid
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='users' AND constraint_name='users_firebase_uid_key') THEN
        ALTER TABLE users ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);
    END IF;
END $$;


-- Ensure "task_notes" table matches the required structure
ALTER TABLE task_notes 
    ADD COLUMN IF NOT EXISTS task_id INTEGER NOT NULL,
    ADD COLUMN IF NOT EXISTS note TEXT,
    ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

-- Ensure foreign key exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='task_notes' AND constraint_name='task_notes_task_id_fkey') THEN
        ALTER TABLE task_notes ADD CONSTRAINT task_notes_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
    END IF;
END $$;


-- Ensure "categories" table matches the required structure
ALTER TABLE categories 
    ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL,
    ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS user_id INTEGER,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();

-- Ensure unique constraint on name
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='categories' AND constraint_name='categories_name_key') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END $$;

-- Ensure foreign key exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='categories' AND constraint_name='categories_user_id_fkey') THEN
        ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;


-- Ensure "user_settings" table matches the required structure
ALTER TABLE user_settings 
    ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL PRIMARY KEY,
    ADD COLUMN IF NOT EXISTS colour_scheme JSONB DEFAULT '{"overdue": "bg-red-600", "lowPriority": "bg-green-200", "highPriority": "bg-red-200", "mediumPriority": "bg-yellow-200"}'::jsonb,
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';

-- Ensure foreign key exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='user_settings' AND constraint_name='user_settings_user_id_fkey') THEN
        ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;
