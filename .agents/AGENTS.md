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

## 3. Web (HTML, CSS, JS) Coding Rules
- **HTML**:
  - Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - Keep IDs unique and descriptive.
- **CSS**:
  - Design system tokens must be declared in `:root` variables (colors, borders, fonts, spacing).
  - Use Flexbox and CSS Grid for layout structuring. Avoid hardcoding positioning values (`top`, `left`) unless absolute overlays are necessary.
  - Support responsive styling.
- **JavaScript (ES6+)**:
  - Always use `const` and `let` instead of `var`.
  - Use arrow functions (`() => {}`) and async/await for asynchronous operations.
  - Implement a built-in lightweight CSV parser to avoid external dependencies.
  - Never use `innerHTML` directly with user input to prevent XSS. Use `textContent` or escape strings dynamically.
  - Catch network errors during `fetch` operations and display styled informative warnings.
