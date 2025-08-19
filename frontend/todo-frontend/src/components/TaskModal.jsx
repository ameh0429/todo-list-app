import React, { useState, useEffect } from "react";

const TaskModal = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    dueTime: "",
  });

  useEffect(() => {
    if (task) {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: dueDate ? dueDate.toISOString().split("T")[0] : "",
        dueTime: dueDate ? dueDate.toTimeString().slice(0, 5) : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        dueTime: "",
      });
    }
  }, [task, isOpen]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    let dueDateTime = null;
    if (formData.dueDate) {
      dueDateTime = new Date(
        `${formData.dueDate}T${formData.dueTime || "23:59"}`
      ).toISOString();
    }

    const taskData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: dueDateTime,
    };

    onSave(taskData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {task ? "Edit Task" : "New Task"}
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[80px] max-h-[200px]"
            />

            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueTime: e.target.value })
                }
                className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={!formData.dueDate}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                {task ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
