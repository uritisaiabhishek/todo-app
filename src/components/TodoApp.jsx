// src/components/TodoApp.jsx
import React, { useState, useEffect } from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [categories, setCategories] = useState([]); // Start with no categories

  const addTodo = (text, category) => {
    setTodos([...todos, { id: Date.now(), text, category, completed: false }]);
  };

  const addCategory = (newCategory) => {
    if (newCategory.trim() !== '' && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.className = darkMode ? '' : 'light-theme';
  }, [darkMode]);

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <button onClick={toggleDarkMode} className="theme-toggle">
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <TodoInput addTodo={addTodo} addCategory={addCategory} categories={categories} />
      <div className="todo-list-container">
        {categories.map((category) => (
          <TodoList
            key={category}
            title={category}
            todos={todos.filter((todo) => todo.category === category)}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </div>
    </div>
  );
};

export default TodoApp;
