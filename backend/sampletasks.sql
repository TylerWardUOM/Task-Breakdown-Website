INSERT INTO public.tasks (
    user_id, title, description, due_date, importance_factor,
    duration, repeat_interval, category_id, notes
) VALUES
(4, 'Submit work report', 'Quarterly report due for review', NOW() + INTERVAL '1 day', 8, 120, NULL, 2, NULL),
(4, 'Buy groceries', 'Milk, eggs, bread, and vegetables', NULL, 2, 30, NULL, 3, NULL),
(4, 'Prepare for job interview', 'Review common questions and practice answers', NOW() + INTERVAL '3 days', 10, 180, NULL, 4, NULL),
(4, 'Doctor''s appointment', 'Routine check-up at 3 PM', NOW() + INTERVAL '7 days', 6, 60, NULL, 3, NULL),
(4, 'Pay electricity bill', 'Last date to avoid late fee', NOW() - INTERVAL '1 day', 10, 15, NULL, 2, NULL),
(4, 'Read 10 pages of book', 'Daily reading habit', NULL, 4, 20, '1 day', 4, NULL),
(4, 'Finish online course module', 'Complete next module on web development', NOW() + INTERVAL '14 days', 6, 90, NULL, 1, NULL),
(4, 'Meditation session', 'Daily mindfulness practice', NULL, 4, 15, '1 day', 2, NULL),
(4, 'Exercise routine', '30-minute workout session', NULL, 6, 30, '1 day', 3, NULL),
(4, 'Call parents', 'Weekly check-in', NOW() + INTERVAL '2 days', 8, 20, '7 days', 4, NULL);
