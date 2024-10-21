// src/components/TodoApp.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import LoginPopup from './LoginPopup';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [todoLists, settodoLists] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch lists with todos when authenticated
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const listsRef = collection(db, 'lists');
        const q = query(listsRef, where('userId', '==', user.uid));

        const unsubscribeTodos = onSnapshot(q, (snapshot) => {
          const fetchedLists = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(fetchedLists);
          settodoLists(fetchedLists.map((list) => list.listName));
        });

        setIsAuthenticated(true);

        return () => unsubscribeTodos();
      } else {
        setIsAuthenticated(false);
        setTodos([]);
        settodoLists([]);
      }
    });

    setLoading(false);

    return () => unsubscribeAuth();
  }, []);

  const addTodo = async (listId, task) => {
    const user = auth.currentUser;
    if (user && typeof task === 'string' && task.trim() !== '') {
      try {
        const listRef = doc(db, 'lists', listId);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
          const listData = listDoc.data();
          const updatedTodos = [
            ...listData.todos,
            {
              id: Date.now().toString(),
              text: task,
              completed: false,
            },
          ];

          await updateDoc(listRef, { todos: updatedTodos });

          setTodos((prevTodos) =>
            prevTodos.map((list) =>
              list.id === listId ? { ...list, todos: updatedTodos } : list
            )
          );
        }
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    } else {
      console.error('Invalid task: Task must be a non-empty string.');
    }
  };

  const toggleTodo = async (listId, todoId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const listRef = doc(db, 'lists', listId);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
          const listData = listDoc.data();
          const updatedTodos = listData.todos.map((todo) =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          );

          await updateDoc(listRef, { todos: updatedTodos });

          setTodos((prevTodos) =>
            prevTodos.map((list) =>
              list.id === listId ? { ...list, todos: updatedTodos } : list
            )
          );
        }
      } catch (error) {
        console.error('Error toggling todo:', error);
      }
    }
  };

  const deleteTodo = async (listId, todoId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const listRef = doc(db, 'lists', listId);
        const listDoc = await getDoc(listRef);

        if (listDoc.exists()) {
          const listData = listDoc.data();
          const updatedTodos = listData.todos.filter((todo) => todo.id !== todoId);

          await updateDoc(listRef, { todos: updatedTodos });

          setTodos((prevTodos) =>
            prevTodos.map((list) =>
              list.id === listId ? { ...list, todos: updatedTodos } : list
            )
          );
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  const handleAddList = async (newList) => {
    const user = auth.currentUser;
    if (user && typeof newList === 'string' && newList.trim() !== '') {
      try {
        await addDoc(collection(db, 'lists'), {
          listName: newList,
          userId: user.uid,
          todos: [],
        });

        settodoLists([...todoLists, newList]);
      } catch (error) {
        console.error('Error adding new list:', error);
      }
    } else {
      console.error('Invalid list name: Must be a non-empty string.');
    }
  };

  const handleDeleteList = async (listId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const listRef = doc(db, 'lists', listId);
        await deleteDoc(listRef); // Use deleteDoc to delete the list from Firestore
        settodoLists((prevLists) => prevLists.filter((list) => list.id !== listId)); // Update local state
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };
  

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.className = darkMode ? '' : 'light-theme';
  }, [darkMode]);

  const onLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => setIsAuthenticated(true))
      .catch((error) => console.error('Login error:', error));
  };

  const onSignUp = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => setIsAuthenticated(true))
      .catch((error) => console.error('Sign up error:', error));
  };

  const logout = () => {
    signOut(auth)
      .then(() => setIsAuthenticated(false))
      .catch((error) => console.error('Logout error:', error));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPopup onLogin={onLogin} onSignUp={onSignUp} />;
  }

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <button onClick={logout} className="logout-button">Logout</button>
      
      <button onClick={toggleDarkMode} className="theme-toggle">
        {darkMode ? 
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </> : <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          </>
        }
      </button>

      <TodoInput handleAddList={handleAddList} />

      <div className="todo-list-container">
        {todos.map((list) => {

          return (
            <TodoList
              key={list.id}
              title={list.listName}
              todos={list.todos}
              addTodo={(task) => addTodo(list.id, task)}
              toggleTodo={(todoId) => toggleTodo(list.id, todoId)}
              deleteTodo={(todoId) => deleteTodo(list.id, todoId)}
              handleDeleteList={() => handleDeleteList(list.id)}
            />
          );
          
        })}
      </div>
    </div>
  );
};

export default TodoApp;
