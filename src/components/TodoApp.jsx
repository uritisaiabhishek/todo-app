// src/components/TodoApp.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Adjust the import path based on your project structure
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import LoginPopup from './LoginPopup';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const [loading, setLoading] = useState(true); // Loading state

  // Use effect to check auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is signed in
      } else {
        setIsAuthenticated(false); // No user is signed in
      }
      setLoading(false); // Set loading to false after checking auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const addTodo = (text, category) => {
    setTodos([...todos, { id: Date.now(), text, category, completed: false }]);
  };

  const onLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User signed in
        console.log('User logged in:', userCredential.user);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Login error:', error);
        // Handle error
      });
  };

  const onSignUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User signed up
        console.log('User signed up:', userCredential.user);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Sign up error:', error);
        // Handle error
      });
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

  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log('User logged out');
        setIsAuthenticated(false);
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Handle error
      });
  };

  // Show loading message while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Show the login popup exclusively if the user is not authenticated
    return <LoginPopup onLogin={onLogin} onSignUp={onSignUp} />;
  }

  // Show the Todo App only if authenticated
  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <button onClick={logout} className="logout-button">Logout</button>
      <button onClick={toggleDarkMode} className="theme-toggle">
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <TodoInput addTodo={addTodo} categories={categories} />
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
