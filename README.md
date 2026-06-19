# Fit & Fun

Fit & Fun is a frictionless, gamified fitness journey built with a focus on high-trust UX, levels-based progression, and maintaining user engagement. 

Designed to remove barriers to entry, the app features a simplified 5-step onboarding flow, daily workouts, and a dynamic visual progress map to keep you motivated throughout your journey.

## 🌟 Key Features

- **Frictionless Onboarding:** Jump straight into the action without unnecessary data collection. The questionnaire is reduced to the absolute essentials (Name, Height, and Weight) with no age or gender requirements.
- **Levels-Based Progression:** Standardized levels keep you progressing without analysis paralysis:
  - **Level 1:** 5-minute daily bodyweight workouts (No equipment needed, the initial 7-day journey)
  - **Level 2:** 10-minute daily workouts (Coming soon)
  - **Level 3:** 15-minute daily workouts (Coming soon)
  - **Level 4:** 20-minute daily workouts (Coming soon)
  - *You must complete each 7-day level before you can unlock the next one!*
- **ExerciseDB V1 API Integration:** Dynamic workout steps are sourced from the free ExerciseDB V1 (AscendAPI) bodyweight database, giving you genuine equipment-free routines with zero-cost and high variety.
- **Interactive Progress Map:** An engaging SVG-based roadmap with animated paths and interactive nodes to track your daily completions.
- **High-Trust UX:** Clean design, dynamic messaging, and smooth transitions that inspire confidence and keep you engaged.
- **Settings & Progression Control:** Manage your journey, connect devices, or easily reset your plan when you need a fresh start.

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI styling
- [Lucide React](https://lucide.dev/) for iconography

## 🚀 Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app/`: Next.js App Router pages (Home, Onboarding, Progress, Workouts, Settings, Profile).
- `src/components/`: Reusable UI components including interactive modals, headers, and navigation.
- `src/context/`: React context (`FitFunContext`) for global state management (progress, workouts completed, user details).
- `src/lib/`: Core utilities and logic, including the `planEngine` for workout generation.
- `src/hooks/`: Custom React hooks like `useWorkoutLogic` for managing workout states.

## 🤝 Contributing & License

Contributions are always welcome! Exercise dataset is provided under open license by [AscendAPI](https://ascendapi.com).
