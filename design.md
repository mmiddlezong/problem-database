# Workflow Stories

The users of the application are regular users, who will use the application to fetch and solve problems.
The user will be able to fetch a problem and enter an answer.
If the answer is correct, they will gain rating, and vice versa.

Another type of user could be an admin user who can adjust, add, or remove problems and solutions.
They could adjust the rating of problems.

# Interface Description

The actual designing will be done with AI tools, but here is the main idea.
- The home page will have a navbar with the pages and a place to view your profile. There will be a place to login if not already logged in.
- The profile will have various stats on it.
- Most likely, the profile will just be embedded into the home page, instead of being a separate page.
- The home page will also have a math problem on it. After solving it, the solution will be shown.
- I think the main interface will be on the home page, because having more pages complicates things for me and users.
- The home page would also show the user's rating, the problem's rating and other info after solving it, and perhaps links to the problem source.
- The problem database will be viewable separate from the rating system.
- The problem database page will have a search bar with various filters.

# Database Schema
```sql
-- Users table to store user profile and rating information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rating INTEGER DEFAULT 1200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Problems table to store math problems
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    hyperlink VARCHAR(255),
    keyphrase VARCHAR(255),
    content TEXT NOT NULL, -- LaTeX formatted
    solution TEXT NOT NULL, -- LaTeX formatted solution
    remark TEXT, -- LaTeX formatted
    rating INTEGER DEFAULT 1200,
    author VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Problem attempts table to track user submissions
CREATE TABLE problem_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    problem_id INTEGER REFERENCES problems(id) ON DELETE SET NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    rating_change INTEGER NOT NULL, -- ELO rating change after attempt
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores changes in a user's ELO over time
CREATE TABLE rating_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_attempt_id INTEGER REFERENCES problem_attempts(id) ON DELETE SET NULL,
    old_rating INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    new_rating INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

# Risks

- I need to learn how to use something like Drizzle or Kysely to interface with Postgres
- One challenge is to actually create the database of problems, which I can probably accomplish with web scraping
- Authentication and authorization is always difficult, but I will probably use Auth.js
- Dealing with images in the problems and solutions is going to be difficult

# Sprints

## Sprint 1

### Goals
For Sprint 1, I want to set up the backend database and populate it with some amount of problems. This means I have
to decide on and finalize my database schema, host the database, and attach an ORM like Drizzle. If I have time, I want
to end with some Next.js server actions or API endpoints that can actually interact with this backend.

### Result
I was able to meet the goals, but midway through I increased the scope of the project by deciding to use
file storage for the storage of problems, which is more flexible and friendly with LaTeX.

## Sprint 2

### Goals
For Sprint 2, I want to finish my file storage system for storing problems and have some way to turn problems into HTML that have rendered LaTeX. I also want to implement support for multiple choice questions and diagrams.