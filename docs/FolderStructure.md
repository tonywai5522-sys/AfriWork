# AfriWork Scalable Enterprise Folder Structure

This document defines a production-ready folder structure for the AfriWork platform, separating frontend and backend responsibilities clearly while keeping the codebase maintainable, scalable, and enterprise-friendly.

---

## 1. Recommended Project Structure

AfriWork/
  README.md
  AGENTS.md
  docs/
    PRD.md
    Architecture.md
    FolderStructure.md
  Website/
    public/
    src/
      app/
      assets/
      components/
      hooks/
      services/
      utils/
      constants/
      contexts/
      layouts/
      pages/
      routes/
      styles/
      types/
      tests/
      main.jsx
      App.jsx
      index.css
      vite.config.js
      package.json
      eslint.config.js
  Backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      repositories/
      validators/
      helpers/
      utils/
      models/
      lib/
      tests/
      server.js
    package.json
    .env.example
    .gitignore

---

## 2. Website Folder Structure (Frontend)

### Website/public/
Purpose:
- Stores static assets such as images, icons, favicons, robots.txt, manifest files, and other public files.

Why it exists:
- These files are served directly by the web server without bundling.
- Keeps static assets separate from application source code.

Example contents:
- favicon.ico
- logo.png
- robots.txt
- manifest.json

---

### Website/src/app/
Purpose:
- Holds app-level bootstrapping and global app configuration.

Why it exists:
- Keeps the startup logic centralized and separate from pages and reusable UI components.
- Ideal for app-wide setup such as providers, routers, and global bootstrap processes.

Example contents:
- AppRouter.jsx
- AppProviders.jsx
- RootLayout.jsx

---

### Website/src/assets/
Purpose:
- Stores local images, fonts, icons, and other static media used in the UI.

Why it exists:
- Keeps design assets organized and easy to reference from components.
- Prevents clutter in component folders.

---

### Website/src/components/
Purpose:
- Contains reusable UI building blocks.

Why it exists:
- Promotes reuse and consistency across pages.
- Keeps pages lightweight and easier to maintain.

Suggested subfolders:
- components/common/
- components/auth/
- components/profile/
- components/jobs/
- components/projects/
- components/admin/

Examples:
- Button.jsx
- InputField.jsx
- Modal.jsx
- Navbar.jsx
- ProfileCard.jsx

---

### Website/src/hooks/
Purpose:
- Stores custom React hooks for reusable logic such as auth, form handling, API calls, and local state behavior.

Why it exists:
- Extracts repeated logic from components.
- Improves readability and testability.

Examples:
- useAuth.js
- useDebounce.js
- useForm.js
- useProfile.js

---

### Website/src/services/
Purpose:
- Houses API integration logic for communicating with the backend.

Why it exists:
- Keeps networking code out of UI components.
- Centralizes request handling, error processing, and endpoint definitions.

Examples:
- authService.js
- jobService.js
- projectService.js
- messageService.js

---

### Website/src/utils/
Purpose:
- Contains small reusable helper functions that do not belong to components or services.

Why it exists:
- Prevents duplication of generic logic.
- Keeps core app logic cleaner and easier to test.

Examples:
- formatDate.js
- currency.js
- validators.js
- slugify.js

---

### Website/src/constants/
Purpose:
- Stores app-wide constants such as route names, API endpoints, roles, statuses, and UI labels.

Why it exists:
- Prevents magic strings and repeated values.
- Makes global configuration easier to maintain.

Examples:
- roles.js
- routes.js
- statusLabels.js

---

### Website/src/contexts/
Purpose:
- Stores React context providers for global state such as authentication, theme, or user data.

Why it exists:
- Avoids prop drilling for shared app state.
- Keeps global state clearly separated from local component state.

Examples:
- AuthContext.jsx
- UserContext.jsx
- ThemeContext.jsx

---

### Website/src/layouts/
Purpose:
- Defines page layouts, shells, and reusable structural wrappers.

Why it exists:
- Keeps page composition consistent.
- Separates layout concerns from page-specific content.

Examples:
- MainLayout.jsx
- AuthLayout.jsx
- DashboardLayout.jsx

---

### Website/src/pages/
Purpose:
- Contains route-level page components.

Why it exists:
- Keeps the application structure aligned with routes.
- Makes navigation and feature organization clear.

Suggested subfolders:
- pages/auth/
- pages/profile/
- pages/jobs/
- pages/projects/
- pages/admin/

Examples:
- HomePage.jsx
- LoginPage.jsx
- ProfilePage.jsx
- JobListPage.jsx

---

### Website/src/routes/
Purpose:
- Holds route definitions and route guards.

Why it exists:
- Separates routing logic from page UI.
- Makes route protection and role-based access easier to manage.

Examples:
- index.jsx
- ProtectedRoute.jsx
- roleRoutes.js

---

### Website/src/styles/
Purpose:
- Stores global styles, Tailwind layer overrides, and design tokens.

Why it exists:
- Keeps styling concerns centralized.
- Helps maintain a consistent visual system across the app.

Examples:
- globals.css
- theme.css
- tailwind.css

---

### Website/src/types/
Purpose:
- Holds shared TypeScript-style type definitions if the project adopts typing later.

Why it exists:
- Creates a central place for shared data structures.
- Helps scaling when the app grows beyond JavaScript-only usage.

Examples:
- user.js
- job.js
- project.js

---

### Website/src/tests/
Purpose:
- Stores frontend unit and integration tests.

Why it exists:
- Ensures UI behavior remains stable as features evolve.
- Supports quality assurance and regression prevention.

---

## 3. Backend Folder Structure

### Backend/src/config/
Purpose:
- Stores environment configuration, app settings, and external service configuration.

Why it exists:
- Keeps configuration in one place for consistency and easier deployment.
- Avoids hardcoding environment-specific values in application code.

Examples:
- appConfig.js
- databaseConfig.js
- appwriteConfig.js
- env.js

---

### Backend/src/controllers/
Purpose:
- Receives HTTP requests, validates input at a high level, and delegates to services.

Why it exists:
- Keeps route handling thin and focused.
- Separates request handling from business logic.

Examples:
- authController.js
- userController.js
- jobController.js
- projectController.js

---

### Backend/src/middleware/
Purpose:
- Contains reusable request processing logic such as authentication, authorization, error handling, logging, rate limiting, and request validation.

Why it exists:
- Centralizes cross-cutting concerns.
- Keeps controllers clean and consistent.

Examples:
- authMiddleware.js
- roleMiddleware.js
- errorHandler.js
- loggerMiddleware.js

---

### Backend/src/routes/
Purpose:
- Defines API endpoints and maps them to controllers.

Why it exists:
- Keeps the API surface organized by domain.
- Supports route versioning and modular routing.

Examples:
- authRoutes.js
- userRoutes.js
- jobRoutes.js
- projectRoutes.js

---

### Backend/src/services/
Purpose:
- Contains business logic for each domain.

Why it exists:
- Keeps business rules out of controllers and routes.
- Makes logic reusable and easier to test.

Examples:
- authService.js
- jobService.js
- projectService.js
- messagingService.js

---

### Backend/src/repositories/
Purpose:
- Encapsulates data access logic to the database or external services.

Why it exists:
- Avoids scattering database queries across services.
- Improves maintainability and makes data-source changes easier.

Examples:
- userRepository.js
- jobRepository.js
- messageRepository.js

---

### Backend/src/validators/
Purpose:
- Holds input validation logic for incoming requests.

Why it exists:
- Keeps validation rules separate from controllers and services.
- Improves readability and reusability.

Examples:
- authValidator.js
- jobValidator.js
- projectValidator.js

---

### Backend/src/helpers/
Purpose:
- Stores domain-specific helper functions used by services and controllers.

Why it exists:
- Keeps shared logic that is more specialized than generic utilities.
- Makes complex workflows easier to manage.

Examples:
- tokenHelper.js
- notificationHelper.js
- fileHelper.js

---

### Backend/src/utils/
Purpose:
- Contains generic utility functions used across the backend.

Why it exists:
- Prevents duplication of common logic such as hashing, formatting, or parsing.

Examples:
- responseFormatter.js
- dateUtils.js
- stringUtils.js

---

### Backend/src/models/
Purpose:
- Defines domain models or schema-like structures used by the application.

Why it exists:
- Provides a clear representation of business entities.
- Helps maintain consistency between the API layer and data layer.

Examples:
- User.js
- Job.js
- Project.js

---

### Backend/src/lib/
Purpose:
- Stores reusable libraries or integrations with third-party systems.

Why it exists:
- Keeps external integrations centralized and easy to swap later.

Examples:
- appwriteClient.js
- emailClient.js
- paymentClient.js

---

### Backend/src/tests/
Purpose:
- Contains backend unit and integration tests.

Why it exists:
- Verifies service behavior, validation logic, middleware, and API endpoints.
- Supports reliable development as the platform grows.

---

## 4. Why This Structure Works

### Separation of Concerns
Each folder has a single purpose, making the codebase easier to navigate and maintain.

### Scalability
As the platform grows, new features can be added with minimal disruption to existing modules.

### Team Collaboration
Backend and frontend responsibilities are clearly divided, making it easier for multiple developers to work independently.

### Maintainability
Common logic is centralized in services, hooks, middleware, helpers, and utilities rather than scattered through the app.

### Enterprise Readiness
The structure supports modular development, role-based code ownership, testing, and future expansion.

---

## 5. Production-Ready Folder Structure Summary

### Frontend
Website/
  public/
  src/
    app/
    assets/
    components/
    hooks/
    services/
    utils/
    constants/
    contexts/
    layouts/
    pages/
    routes/
    styles/
    types/
    tests/

### Backend
Backend/
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    repositories/
    validators/
    helpers/
    utils/
    models/
    lib/
    tests/

---

## 6. Recommended Naming Conventions
- Use lowercase folder names for consistency.
- Use PascalCase for React components.
- Use camelCase for JavaScript files and functions.
- Use descriptive names that match domain concepts.
- Keep files focused on a single responsibility.

---

## 7. Final Recommendation
For AfriWork, this folder structure is suitable for a scalable SaaS product because it supports:
- Clean frontend and backend separation
- Maintainable domain-driven organization
- Reusable components, hooks, and services
- Strong support for testing, security, and future feature growth
