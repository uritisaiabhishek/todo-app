// src/components/TodoItem.jsx
import React from 'react';

const TodoItem = ({ todo, toggleTodo, deleteTodo }) => {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span>{todo.text}</span>
      <div>
        <button onClick={() => toggleTodo(todo.id)}>
          {todo.completed ? 'Undo' : 'Complete'}
        </button>
        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
      </div>
    </li>
  );
};

export default TodoItem;
