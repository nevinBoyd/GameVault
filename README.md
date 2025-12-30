GameVault
A Secure Video Game Explorer with Authentication & User Interaction 

Business Problem Scenario 

Who is the user? 
Gamers and casual players who want a simple, organized way to explore games. 

Goal / Need 
Browse games, read clear summaries, view opinions, and save titles. Logged-in users 
should have personalized, secure features. 

Why it matters 
Most game platforms are cluttered, overwhelming, ad-heavy, or toxic. Without a 
structured space, users forget games, lose personalization, and have nowhere safe to 
manage their thoughts. 
Solution 

GameVault will provide a structured platform where users can: 
• Browse games publicly 
• Access detailed pages when authenticated 
• Leave reviews (create, edit, delete their own) 
• Save games to favorites / wishlist 

Value / Impact 
GameVault delivers a clean, secure, user-owned browsing experience while 
demonstrating real-world authentication, RESTful API structure, and full CRUD functionality. 

Development Stages 
• Data Models → User, Game (seeded/read-only), Review (User + Game), Favorites                  
• Backend API - Flask REST API, protected routes, ownership enforcement 
• Authentication (JWT) - Signup, Login, /me, persistent login, multi-user reliability 
• Frontend (React) - Public browse + auth-gated details, JWT Bearer tokens 
• CRUD - Full CRUD on Reviews; only owners can edit/delete 
• UX/UI - Game grid, detail pages, conditional rendering, error/loading messaging 
• Testing - API testing, auth flow validation, CRUD + ownership checks 

Anticipated Challenges 
• Secure JWT persistence 
• Backend ownership enforcement 
• Maintaining simple UX 

Tools & Architecture 
Backend:     Flask, SQLAlchemy, Flask-JWT-Extended 
Frontend:    React 
Database:    SQLite / PostgreSQL 
Reasoning: JWT supports reliable multi-user auth, Flask provides a clean REST 
structure, and React enables a responsive SPA experience. 

Timeline & Scope (6-Day Plan) 
Day - Focus - Hours
1. Business problem, dataset, ERD, wireframes 4–5
2. Flask backend setup, User model, JWT auth 5–6
3. Game routes, Review CRUD, ownership testing 5–6 
4. React setup, Login/Signup, JWT persistence, auth gating 4–5
5. Game browsing UI, detail page, Review CRUD UI, Favorites 5–6
6. Styling, bug fixes, auth reliability testing, MVP prep 4–5
Research Focus 
• JWT best practices 
Focus 

Business problem, dataset, ERD, wireframes 
Flask backend setup, User model, JWT auth 
Game routes, Review CRUD, ownership testing 
React setup, Login/Signup, JWT persistence, auth 
gating 

Game browsing UI, detail page, Review CRUD UI, Favorites 

Styling, bug fixes, auth reliability testing, MVP prep 
• Secure authorization handling 
• UX clarity 

Scope Control 
MVP = Authentication + Browsing + Review CRUD 
Favorites added only after stability is confirmed. 
Hou