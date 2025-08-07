import React, { useState, useEffect } from "react";
import { Plus, Search, LogOut, Sun, Moon } from "lucide-react";
import AuthPage from "./components/AuthPage";
import TaskItem from "./components/TaskItem";
import TaskModal from "./components/TaskModal";
import { api } from "./services/api";
import WelcomeMessage from "./components/WelcomeMessage";
import { register } from "./serviceWorkerRegistration";

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const loadTasks = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus !== "all") {
        filters.isCompleted = (filterStatus === "completed").toString();
      }
      if (filterPriority !== "all") filters.priority = filterPriority;

      console.log("Loading tasks with filters:", filters); // ✅ Debug log

      const result = await api.getTasks(token, filters);

      if (result.success) {
        console.log("Fetched tasks:", result.data.tasks); // ✅ Debug log
        setTasks(result.data.tasks);
      } else {
        console.error("API responded without success:", result);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, filterStatus, filterPriority]);

  useEffect(() => {
    register({
      onUpdate: () => {
        setUpdateAvailable(true);
      },
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true); // Show install button now
      console.log("Install prompt captured");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(`User response to install: ${choiceResult.outcome}`);
        setDeferredPrompt(null);
        setShowButton(false);
      });
    }
  };

  useEffect(() => {
    let deferredPrompt;
    const installButton = document.getElementById("installButton");

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installButton) installButton.style.display = "inline-block";

      installButton?.addEventListener("click", () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log(`User choice: ${choiceResult.outcome}`);
          installButton.style.display = "none";
          deferredPrompt = null;
        });
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token, searchTerm, filterStatus, filterPriority, loadTasks]);

  const handleAuth = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const result = await api.createTask(token, taskData);
      if (result.success) {
        setTasks([result.data.task, ...tasks]);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const result = await api.updateTask(token, editingTask._id, taskData);
      if (result.success) {
        setTasks(
          tasks.map((t) => (t._id === editingTask._id ? result.data.task : t))
        );
        setShowModal(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    console.log("Sending toggle request:", taskId, isCompleted); // NEW
    const result = await api.updateTask(token, taskId, { isCompleted });
    console.log("Toggle result:", result); // NEW
    if (result.success) {
      setTasks(tasks.map((t) => (t._id === taskId ? result.data.task : t)));
    } else {
      console.error("Toggle failed", result.message || result.error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const result = await api.deleteTask(token, taskId);
      if (result.success) {
        setTasks(tasks.filter((t) => t._id !== taskId));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;

  if (!token) return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">My Tasks</h1>
              {user && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome,{" "}
                  <span className="font-semibold">
                    {user.name || user.email}
                  </span>
                  {user.email && (
                    <span className="ml-2 text-gray-400">({user.email})</span>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedCount} of {totalCount} completed
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          {updateAvailable && (
            <div className="update-banner">
              <p>🔄 New version available!</p>
              <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
          )}
          {/* Your app content */}
        </div>

        <div className="p-4">
          <WelcomeMessage />
          {/* Your other components */}
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="flex-1 p-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No tasks found
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                user={user}
                key={task._id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h1>Welcome to your DailyTaskTracker</h1>
        {showButton && (
          <button onClick={handleInstallClick}>Install App</button>
        )}
        {/* Rest of your app content */}
      </div>

      <button
        onClick={() => {
          setEditingTask(null);
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TaskModal
        task={editingTask}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />

      <button
        id="installButton"
        style={{ display: "none" }}
        className="fixed bottom-6 left-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
      >
        📲
      </button>
    </div>
  );
};

export default App;
