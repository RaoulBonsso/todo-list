"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTheme } from "next-themes";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import { Sun, Moon } from "lucide-react";

// Interface pour la structure d'une tâche
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function Home() {
  // État pour stocker les tâches
  const [tasks, setTasks] = useState<Task[]>([]);
  const { theme, setTheme } = useTheme();

  // Charger les tâches depuis localStorage au montage du composant
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Sauvegarder les tâches dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Ajouter une nouvelle tâche
  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  // Supprimer une tâche
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Marquer une tâche comme complétée
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Modifier le texte d'une tâche
  const editTask = (id: string, newText: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  // Gérer le drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary transition-colors duration-500">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Ma Liste de Tâches</h1>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>

        <TaskInput onAdd={addTask} />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="mt-8"
              >
                <TaskList
                  tasks={tasks}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  onEdit={editTask}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
             🎉 Aucune tâche pour le moment. Ajoutez-en une ! 🚀
          </p>
        )}
      </div>
    </div>
  );
}