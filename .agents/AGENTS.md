# Project Coding Rules (Python & Web)

This file defines the project-specific coding rules and standard guidelines for Python and Web (HTML/CSS/JS) development. All agents and developers working on this project must adhere to these rules.

---

## 1. General Principles
- **Aesthetics & Premium Design**: UI/UX must look premium, modern (dark mode, glassmorphism), and highly responsive. Avoid default layouts or plain placeholder styling.
- **Strict Error Handling**: All file actions, fetches, and external inputs must have try-catch/except blocks with user-friendly warnings or logs.
- **Maintain Clean Code**: Clean up temporary files, debugging prints, and unused code before committing.

---

## 2. Python Coding Rules
- **Formatting & Style**:
  - Follow PEP 8 guidelines.
  - Use 4 spaces for indentation.
  - Limit line length to 79/100 characters where possible.
- **Naming Conventions**:
  - Modules/Files: `snake_case.py`
  - Classes: `PascalCase`
  - Functions & Variables: `snake_case`
  - Constants: `UPPER_SNAKE_CASE`
- **Documentation**:
  - Write clear docstrings for all public modules, classes, and functions using Google style formatting.
  - Maintain inline comments explaining *why* a complex logic block was written, not *what* it does.
- **Types & Reliability**:
  - Use type hints (`def func(name: str) -> bool:`) where appropriate to increase code readability.
  - Always manage files/resources using `with` context managers (e.g. `with open(...) as f:`).
- **Testing**:
  - Every core parser or logic change must be accompanied by unit tests in `test_tracker.py`.
  - Run tests with `python -m unittest test_tracker.py` to ensure zero regressions.

---

## 3. Web (React, Tailwind CSS, JS) Coding Rules
- **React & Modularity**:
  - Structure the application with small, highly focused, and reusable functional components.
  - Separate business logic and API fetching into custom hooks (e.g., `useReportData`).
  - Follow modular file structures (e.g., `components/`, `hooks/`, `utils/`).
  - Prioritize proper state management (local state, context, or lightweight state managers).
- **Tailwind CSS**:
  - Use Tailwind CSS utility classes for all styling requirements to ensure flexibility and consistency.
  - Avoid inline styles or custom Vanilla CSS classes unless absolutely necessary for complex dynamic calculations.
  - Declare project-specific design tokens (colors, shadows, custom animations) in `tailwind.config.js` rather than hardcoding arbitrary utility values (e.g., use `bg-primary` instead of `bg-[#0b0f19]`).
- **JavaScript / TypeScript**:
  - Use modern ES6+ features (arrow functions, destructured assignments, async/await).
  - Implement a built-in lightweight CSV parser to avoid bloated third-party dependencies.
  - Always clean up event listeners, intervals, and subscription state inside hook cleanups (`return () => ...`).
  - Sanitize user-provided values and handle API/fetch errors with beautiful, styled UI feedback.
