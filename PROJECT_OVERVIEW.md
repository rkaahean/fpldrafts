# Project Overview: FPL Planner

## 1. Executive Summary
**FPL Planner** is a sophisticated decision-support engine designed for Fantasy Premier League (FPL) enthusiasts. Unlike standard tracker apps, this platform provides a dual-layer management system: a **Live Tracker** for monitoring real-world team performance and a **Simulation Sandbox (Drafting)** for testing "what-if" transfer strategies. By combining high-fidelity statistical data with predictive simulation, the tool empowers users to make data-driven decisions regarding squad transfers and captaincy.

---

## 2. Core Functional Capabilities

### 2.1. Squad Management (Live)
*   **Real-time Tracking:** Monitor live player performance, including points, bonus points (BPS), and ICT indices.
*   **Transfer Log:** A detailed history of player arrivals and departures within a user's official squad.
*   **Gameweek Analysis:** Comprehensive review of weekly performance, including captaincy impact and chip usage.

### 2.2. Strategy Simulation (Draft Mode)
*   **Sandbox Environment:** Create multiple virtual "Drafts" to simulate different team configurations without impacting the official FPL team.
*   **Transfer Modeling:** Test the long-term impact of transfers by simulating bank balances and team structure changes over multiple gameweeks.
*   **Risk Assessment:** Compare different squad iterations to identify optimal player compositions for upcoming fixtures.

### 2.3. Advanced Analytics
*   **Predictive Metrics:** Support for "Expected" statistics (xG, xA, xGI) and their "per 90" variations to evaluate player underlying performance.
*   **Efficiency Tracking:** Monitoring of player value trends (cost changes) and form vs. fixture difficulty.

---

## 3. System Architecture

The application utilizes a modern, high-performance full-stack architecture.

### 3.1. Frontend Layer
*   **Framework:** **Next.js (React 19)** for optimized rendering and efficient routing.
*   **State Management:** 
    *   **Zustand:** Handles lightweight, client-side application state.
    *   **TanStack React Query:** Manages complex server-side caching and asynchronous data synchronization.
*   **User Interface:**
    *   **Tailwind CSS:** For responsive, utility-first styling.
    *   **Radix UI:** Provides unstyled, accessible UI primitives (Dialogs, Selects, etc.).
    *   **Framer Motion:** Enables smooth layout transitions and interactive animations.
*   **Data Visualization:** **Chart.js** for rendering statistical trends and player performance histories.

### 3.2. Backend & Data Layer
*   **Database:** **PostgreSQL** for robust, relational data storage.
*   **ORM:** **Prisma** manages the complex relational schema and provides type-safe database queries.
*   **Authentication:** **NextAuth.js** handles secure user sessions and identity management.

### 3.3. Data Engineering (ETL Pipeline)
The project implements a custom **Extract-Transform-Load (ETL)** pipeline via specialized TypeScript scripts (`scripts/`) to process raw FPL API data:
1.  **Bootstrap:** Initializes the database schema and environment.
2.  **Element Loading:** Ingests core player attributes.
3.  **Fixture Loading:** Ingests match schedules and results.
4.  **Statistical Ingestion:** Processes granular gameweek and match-level player data.

---

## 4. Data Model Schema (Key Entities)

The database is designed to handle highly relational and time-series data.

| Entity | Description |
| :--- | :--- |
| `FPLPlayer` | Detailed profile containing seasonal stats, ICT indices, and market value. |
| `FPLTeam` | Represents a user's official squad linked to a specific season. |
| `FPLDrafts` | A virtual squad used for simulations, independent of the user's live team. |
| `FPLFixtures` | Records match details, including difficulty and scores. |
| `FPLGameweekPicks` | Captures specific player selections and captaincy for a single gameweek. |
| `FPLGameweekTransfers`| Tracks the movement of players in/out of a team per gameweek. |

---

## 5. Quality Assurance & Reliability

To ensure the accuracy of the statistical data and the reliability of the simulation engine, the project employs:

*   **Unit & Integration Testing:** **Vitest** is used for high-speed testing of business logic and utility functions.
*   **API Mocking:** **MSW (Mock Service Worker)** intercepts network requests to allow for isolated, predictable frontend testing.
*   **Type Safety:** Strict **TypeScript** implementation across the entire stack to prevent runtime errors in the complex statistical calculations.
