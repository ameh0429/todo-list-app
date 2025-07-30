import React from 'react';
import { CheckCircle2, Circle, Edit3, Trash2, Clock, AlertCircle } from 'lucide-react';
import { priorityColors } from '../utils/constants';

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
      task.isCompleted ? 'border-green-400 bg-gray-50' : 
      isOverdue ? 'border-red-400' : 'border-indigo-400'
    }`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task._id, !task.isCompleted)} className="mt-1 flex-shrink-0">
          {task.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-indigo-500 transition-colors" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-gray-900 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(task._id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {task.description && (
            <p className={`text-sm text-gray-600 mt-1 ${task.isCompleted ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority] || priorityColors['Medium']}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                <Clock className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
