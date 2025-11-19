
import React from 'react';
import { TodoItem } from '../../../../types.ts';
import { CheckIcon, CircleIcon } from '../../../components/IconComponents.tsx';

interface TodoListProps {
  items: TodoItem[];
}

const TodoList: React.FC<TodoListProps> = ({ items }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Các bước thiết lập</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center">
            {item.completed ? (
              <CheckIcon className="w-6 h-6 text-green-400 mr-3" />
            ) : (
              <CircleIcon className="w-6 h-6 text-slate-500 mr-3" />
            )}
            <span className={`text-lg ${item.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;