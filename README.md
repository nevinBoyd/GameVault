# GameVault

GameVault is a full-stack video game browsing platform designed to securely authenticate users, display curated game information, and allow meaningful interaction through favorites and reviews. The goal was not only to make something functional, but to make it feel structured, stable, and intentional as a user experience.

The core idea is simple: browse games, view meaningful details, favorite what matters, and leave personal thoughts through reviews — all within a UI that stays consistent, grounded, and visually coherent without gimmicks or chaos.

---

## Tech Stack

### Frontend

| Technology   | Purpose                                 |
| ------------ | --------------------------------------- |
| React        | Core UI framework                       |
| Vite         | Development server + bundling           |
| Bootstrap    | Mobile-first responsive layout          |
| Custom CSS   | Theming, card design, subtle animations |
| React Router | Client-side navigation                  |

---

### Backend

| Technology     | Purpose                       |
| -------------- | ----------------------------- |
| Flask          | Backend application framework |
| SQLAlchemy     | ORM + relational modeling     |
| SQLite         | Local development database    |
| Alembic        | Database migrations           |
| Flask Sessions | Cookie-based authentication   |
| bcrypt         | Secure password hashing       |

---

### Other

* RESTful API design
* Session-based authentication (not JWT)
* RAWG-seeded local data source
* Ownership-enforced review and favorite logic

---

## Core Functionality

### Game Browsing

* Game listing grid with artwork and ratings
* Genre filtering
* Responsive design on desktop and mobile
* Stable and predictable card layout

---

### Favorites

* Favorite and unfavorite games
* Dedicated favorites view
* Protected user-scoped data
* No duplicate favorites

---

### Reviews

* Write reviews
* Edit reviews
* Delete reviews
* Each user may review a game once
* Ownership enforced strictly
* Inline validation instead of intrusive alerts

---

### Authentication

* Register
* Login
* Logout
* Session persistence
* Secure password hashing
* `/me` session restore flow

---

## How to Run the App Locally

### Backend

```bash
pipenv install
pipenv shell
export FLASK_APP=app.py
flask db upgrade
flask --app app.py run
```

Runs on port `5000`.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on Vite’s dev server and talks to the backend through the API layer.

---

## Development Approach

GameVault was built with a priority on clarity, predictability, and trustworthiness instead of shortcuts. The backend is structured to feel like something that could realistically be evaluated, not something barely held together. Authentication logic, ownership enforcement, and local game storage remove uncertainty and help keep behavior stable.

On the frontend side, most of the meaningful work happened after things were technically “working.” Layout shifts, inconsistent spacing, and accidental CSS bleed made it clear that UX stability matters just as much as raw capability. Routing behavior, favorites isolation, and review handling all received multiple passes until they actually felt right.

A huge focus existed around preventing UI and data surprises. Everything is designed to feel grounded, consistent, and reliable while browsing, selecting games, marking favorites, and interacting with reviews.

---

## Reflection

This project ended up being a lesson in maturity more than feature chasing.

The backend became an exercise in building something dependable: session-based authentication instead of “flashy token systems,” stored local game data instead of constantly hitting RAWG API, and strict ownership enforcement so nothing feels careless. It forced slower, more deliberate thinking about security, stability, and contract clarity between frontend and backend.

The frontend turned into refinement work instead of just “make it appear on screen.” Getting information to display was the easy part. Making it readable, visually calm, and structurally consistent took real effort. The favorites system and review UX both needed multiple rounds to prevent layout regressions or confusing transitions. Route-aware styling ended up being essential to prevent one feature bleeding into another.

There were multiple moments where things looked “good enough,” but they really weren’t. Iterating until the UI stopped feeling accidental and started feeling intentional was one of the biggest growth moments in this build.

Overall, GameVault feels stable, cohesive, and real. It is reliable, maintains trust with user data, and presents information in a way that feels deliberate.

---

## Future Iterations

Possible future expansion could include:

* Loading skeletons for smoother perceived performance
* Additional UI polish and motion refinement
* User profile system
* Sorting, searching, and discovery enhancements
* Admin moderation tools
* Paginated browsing or infinite scroll
* Improved accessibility support
* Optional data refresh pipeline

---

## Final Notes

GameVault represents a full-stack application built with intention, structure, and respect for real-world expectations. It demonstrates secure authentication, relational data design, a thoughtful frontend, and a presentation style that feels reliable and grounded rather than rushed or chaotic.
