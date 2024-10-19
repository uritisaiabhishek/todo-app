// src/components/TodoList.jsx
import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ title, todos, toggleTodo, deleteTodo }) => {
  return (
    <div className="todo-category">
      <h2>{title}</h2>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
