-- Create event_types table
CREATE TABLE IF NOT EXISTS event_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add initial event types
INSERT INTO event_types (name) VALUES
    ('Conference'),
    ('Article'),
    ('Podcast'),
    ('Webinar'),
    ('Product Launch'),
    ('Earnings Call');

-- Add event_type_id to tech_events table
ALTER TABLE tech_events
ADD COLUMN event_type_id UUID REFERENCES event_types(id);

-- Add custom_event_type for cases where the type is not in the predefined list
ALTER TABLE tech_events
ADD COLUMN custom_event_type TEXT;
