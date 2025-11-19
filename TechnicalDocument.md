# Technical Architecture Document: Mini-modules & Feature-Sliced Structure

**Version:** 1.0.0
**Date:** 2024-11-13
**Author:** AI Assistant

---

### 1. Introduction & Goal

This document outlines the technical architecture of the Personal Finance Onboarding application, which has been refactored from a monolithic structure to a **Mini-modules** (also known as **Feature-Sliced**) architecture.

The primary goal of this refactoring is to enhance **scalability, maintainability, and developer experience**. By organizing the codebase around features, we create a clear, decoupled, and scalable structure that supports future growth.

### 2. Core Concepts

#### 2.1. Feature Slices

The core of this architecture is the `src/features` directory. A "feature" is a distinct piece of application functionality (e.g., `onboarding`, `dashboard`). Each feature is a self-contained module, co-locating all its related code.

**Benefits:**
-   **High Cohesion:** All code related to a feature (UI, logic, API calls) is in one place.
-   **Low Coupling:** Features are independent of each other, reducing the risk of unintended side effects.
-   **Scalability:** Adding a new feature is as simple as creating a new directory under `src/features` without modifying existing ones.

#### 2.2. Custom Hooks for Logic

Business logic and state management are extracted from components and placed into custom hooks (e.g., `useOnboarding.ts`).

**Benefits:**
-   **Separation of Concerns:** Components focus on rendering UI (`what it looks like`), while hooks handle the logic (`how it works`).
-   **Reusability & Testability:** Logic within hooks can be tested independently of the UI.

#### 2.3. Modular AI Agents

Instead of a single, large service file, each AI-driven feature has its own set of modular service files. For the `onboarding` feature, this includes:
-   `schemas.ts`: Defines the expected JSON structures from the AI.
-   `prompts.ts`: Manages the generation of prompts sent to the AI.
-   `onboardingAIAgent.ts`: The core service that orchestrates API calls using the defined prompts and schemas.

**Benefits:**
-   **Clarity:** Each file has a single, clear responsibility.
-   **Maintainability:** It's easy to find and update a specific prompt or schema without searching through a large file.

### 3. Directory Structure

```
src/
├── components/         # Global, reusable UI components (e.g., Icons, Buttons).
│
├── features/           # **CORE DIRECTORY**: Contains all application features.
│   │
│   ├── onboarding/     # Example: The "Onboarding" feature slice.
│   │   ├── components/ # Components used ONLY by the onboarding feature.
│   │   ├── hooks/      # Custom hooks for the onboarding feature's logic.
│   │   ├── services/   # Services specific to this feature (API calls, etc.).
│   │   └── OnboardingScreen.tsx # The entry point/container component for the feature.
│   │
│   └── dashboard/      # Example: The "Dashboard" feature slice.
│       ├── components/
│       └── DashboardScreen.tsx
│
├── hooks/              # Global custom hooks used across multiple features.
│
├── services/           # Global services (e.g., authentication).
│
├── utils/              # Utility functions (formatters, validators).
│
├── App.tsx             # The main application shell: routing, layout, navigation.
├── constants.ts        # Global constants.
├── types.ts            # Global TypeScript types and interfaces.
└── index.tsx           # Application entry point.
```

### 4. Data Flow (Example: Onboarding)

1.  **`App.tsx`**: Renders the main layout and navigation. When the 'chatbot' tab is active, it renders `<OnboardingScreen />`.
2.  **`OnboardingScreen.tsx`**:
    -   Calls the `useOnboarding()` hook to get all necessary state and handlers (`messages`, `isLoading`, `handleSendMessage`).
    -   Passes this state down to presentational components like `<ChatWindow />` and `<TodoList />`.
3.  **`useOnboarding.ts`**:
    -   Manages the entire state of the onboarding conversation (`messages`, `onboardingState`, etc.).
    -   The `processOnboardingStep` function orchestrates the logic. When user input is received, it calls the AI service.
4.  **`onboardingAIAgent.ts`**:
    -   Receives the current state and user message from the hook.
    -   Uses `prompts.ts` to generate the correct prompt.
    -   Uses `schemas.ts` to select the correct response schema.
    -   Makes the API call to Gemini.
    -   Returns the structured response back to the `useOnboarding` hook.
5.  The hook updates its state, causing `OnboardingScreen.tsx` and its children to re-render with the new information.

### 5. Future Development Guidelines

-   **Adding a New Feature (e.g., "Transactions"):**
    1.  Create a new directory: `src/features/transactions`.
    2.  Create the entry component: `src/features/transactions/TransactionsScreen.tsx`.
    3.  Add any feature-specific components, hooks, or services inside the `transactions` directory.
    4.  Add a new tab in `App.tsx` to render the `TransactionsScreen`.

-   **Adding a Reusable Component:**
    1.  If a component (e.g., a custom `Button`) is needed in both `onboarding` and `dashboard`, place it in `src/components/`.

By following this structure, we ensure the application remains clean, organized, and easy to extend as it grows.
