-- ============================================================================
-- DEVELOPMENT SAMPLE DATA ONLY (loaded by the "dev" profile).
-- Every row is flagged is_sample = TRUE and is NOT a real achievement, project,
-- credential or job. No certificates, education or employment are seeded.
-- Replace or delete these rows from the admin dashboard.
-- ============================================================================

INSERT INTO skills (name, category, icon, proficiency, is_sample, display_order, created_at, updated_at) VALUES
    ('React',       'FRONTEND', 'react',    NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TypeScript',  'FRONTEND', 'code',     NULL, TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Tailwind CSS','FRONTEND', 'palette',  NULL, TRUE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Java',        'BACKEND',  'coffee',   NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Spring Boot', 'BACKEND',  'leaf',     NULL, TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('PostgreSQL',  'DATABASE', 'database', NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Gemini API',  'AI',       'sparkles', NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Docker',      'CLOUD',    'container',NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Git',         'TOOLS',    'git',      NULL, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

INSERT INTO projects (slug, title, summary, description, problem, solution, architecture, category, status,
                      featured, is_sample, display_order, created_at, updated_at) VALUES
    ('sample-ai-portfolio',
     'AI Portfolio Platform (sample entry)',
     'SAMPLE ENTRY: placeholder describing this portfolio platform. Replace it with a real project from the admin dashboard.',
     'This is sample data created for local development. It is not a claim about a real, shipped project.',
     'Sample problem statement. Describe the real problem your project solves.',
     'Sample solution. Describe what you actually built and how.',
     'Sample architecture notes. React single-page app talking to a Spring Boot REST API backed by PostgreSQL.',
     'Full-Stack', 'IN_PROGRESS', TRUE, TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sample-task-tracker',
     'Task Tracker (sample entry)',
     'SAMPLE ENTRY: a second placeholder project so listings, filters and pagination can be previewed.',
     'This is sample data created for local development. It is not a real project.',
     NULL, NULL, NULL,
     'Web App', 'PLANNED', FALSE, TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO project_technologies (project_id, sort_index, technology)
    SELECT id, 0, 'React' FROM projects WHERE slug = 'sample-ai-portfolio';
INSERT INTO project_technologies (project_id, sort_index, technology)
    SELECT id, 1, 'Spring Boot' FROM projects WHERE slug = 'sample-ai-portfolio';
INSERT INTO project_technologies (project_id, sort_index, technology)
    SELECT id, 2, 'PostgreSQL' FROM projects WHERE slug = 'sample-ai-portfolio';
INSERT INTO project_technologies (project_id, sort_index, technology)
    SELECT id, 0, 'TypeScript' FROM projects WHERE slug = 'sample-task-tracker';
INSERT INTO project_technologies (project_id, sort_index, technology)
    SELECT id, 1, 'PostgreSQL' FROM projects WHERE slug = 'sample-task-tracker';

INSERT INTO project_features (project_id, sort_index, feature)
    SELECT id, 0, 'Sample feature: replace with a real capability' FROM projects WHERE slug = 'sample-ai-portfolio';
