"use client";  
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to Neurodivergent Task Manager</h1>
      <Button variant="primary" onClick={() => alert("Getting Started!")}>
        Get Started
      </Button>
      <Button variant="secondary" onClick={() => alert("Getting Stopped")}>
        Get Stopped
      </Button>
    </div>
  );
}
