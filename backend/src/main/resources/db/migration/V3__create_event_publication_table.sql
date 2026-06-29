CREATE TABLE event_publication (
    id                    UUID NOT NULL PRIMARY KEY,
    listener_id           TEXT NOT NULL,
    event_type            TEXT NOT NULL,
    serialized_event      TEXT NOT NULL,
    publication_date      TIMESTAMP NOT NULL,
    completion_date       TIMESTAMP,
    completion_attempts   INT NOT NULL DEFAULT 0,
    last_resubmission_date TIMESTAMP,
    status                VARCHAR(20)
);

CREATE INDEX idx_event_publication_uncompleted
    ON event_publication (completion_date)
    WHERE completion_date IS NULL;
