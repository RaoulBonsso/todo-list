"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTheme } from "next-themes";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import Loader from "@/components/Loader";
import { Sun, Moon } from "lucide-react";
import { todoService, Task } from "@/lib/todo-service";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Charger les tâches depuis DynamoDB au montage du composant
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const loadedTasks = await todoService.getAllTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Erreur lors du chargement des tâches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Ajouter une nouvelle tâche
  const addTask = async (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    try {
      await todoService.addTask(newTask);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
    }
  };

  // Supprimer une tâche
  const deleteTask = async (id: string) => {
    try {
      await todoService.deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  // Marquer une tâche comme complétée
  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    try {
      const taskToUpdate = updatedTasks.find((task) => task.id === id);
      if (taskToUpdate) {
        await todoService.updateTask(taskToUpdate);
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  // Modifier le texte d'une tâche
  const editTask = async (id: string, newText: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: newText } : task
    );
    try {
      const taskToUpdate = updatedTasks.find((task) => task.id === id);
      if (taskToUpdate) {
        await todoService.updateTask(taskToUpdate);
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Erreur lors de la modification de la tâche:", error);
    }
  };

  // Gérer le drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary transition-colors duration-500">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">✅ Ma Liste de Tâches 📝</h1>
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