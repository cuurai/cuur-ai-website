// src/app/page.tsx
import WaitlistForm from "../components/WaitlistForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-4xl font-bold mb-6">cuur.ai</h1>
      <p className="text-lg mb-8 text-center">Healthcare AI</p>
      <WaitlistForm />
    </div>
  );
}
