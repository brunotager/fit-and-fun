# Fit & Fun

Fit & Fun is a frictionless, gamified 7-day guided fitness journey built with a focus on high-trust UX and maintaining user engagement. 

Designed to remove barriers to entry, the app features minimal onboarding, quick workouts capped at 10 minutes, and a dynamic visual progress map to keep you motivated throughout your week.

## 🌟 Key Features

- **Gamified 7-Day Journey:** A structured path to build consistency and momentum.
- **Frictionless Onboarding:** Jump straight into the action without unnecessary data collection (no age or gender requirements).
- **Interactive Progress Map:** An engaging SVG-based roadmap with animated paths and interactive nodes to track your daily completions.
- **Bite-Sized Workouts:** All sessions are capped at 10 minutes or less to ensure they easily fit into any schedule.
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

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.
