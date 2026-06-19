import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TimeEntryForm from "@/components/form/TimeEntryForm";
import TimeEntriesList from "@/components/list/TimeEntriesList";
import YearlyProgress from "@/components/YearlyProgress";
import WeeklyProgress from "@/components/WeeklyProgress";
import { useForm } from "@/hooks/useForm";
import { useEntries } from "@/hooks/useEntries";
import { FormHookResult, EntriesHookResult, TimeEntry } from "@/types";
import { DailyHeatmap } from "./components/DailyHeatmap";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";

const App: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [weekStart, setWeekStart] = useState<string>(() => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = today.getDate() - day; // Subtract days since last Sunday
    const sunday = new Date(today.setDate(diff));
    return sunday.toISOString().split("T")[0];
  });

  const {
    entry,
    setEntry,
    editingId,
    setEditingId,
    resetForm,
    handleEdit,
  }: FormHookResult = useForm();
  const {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
  }: EntriesHookResult = useEntries(weekStart);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEntry(editingId, entry);
      } else {
        await addEntry(entry);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteEntry(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto flex justify-end mb-4">
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Timekeeper</CardTitle>
          <CardDescription>
            Track your daily hours and manage your time effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeEntriesList
            entries={entries}
            weekStart={weekStart}
            setWeekStart={setWeekStart}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
          <DailyHeatmap />

          <TimeEntryForm
            entry={entry}
            setEntry={setEntry}
            editingId={editingId}
            setEditingId={setEditingId}
            resetForm={resetForm}
            handleEdit={handleEdit}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
