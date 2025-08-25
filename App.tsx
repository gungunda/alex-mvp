import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import { PlannerProvider } from "./store/PlannerContext";
import Dashboard from "./pages/Dashboard";
import Offload from "./pages/Offload";
import WeekTemplate from "./pages/WeekTemplate";

export default function App(){
  return (
    <PlannerProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/offload" element={<Offload />} />
        <Route path="/week" element={<WeekTemplate />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <footer className="text-center text-muted py-6">Study Planner · локальное сохранение · {new Date().getFullYear()}</footer>
    </PlannerProvider>
  );
}
