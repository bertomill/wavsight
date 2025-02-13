-- Remove '7p' prefix from event names
UPDATE tech_events
SET event_name = regexp_replace(event_name, '^7p\s*', '')
WHERE event_name LIKE '7p%';
