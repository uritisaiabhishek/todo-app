// src/components/TodoApp.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Adjust the import path based on your project structure
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import TodoInput from './TodoInput';
import TodoList from './TodoList';
import LoginPopup from './LoginPopup';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const [loading, setLoading] = useState(true); // Loading state
  const [showCompleted, setShowCompleted] = useState(false); // New state for completed filter

  // Load todos from Firestore
  const loadTodos = async () => {
    const todosCollection = collection(db, 'todos');
    const todoSnapshot = await getDocs(todosCollection);
    const todosList = todoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTodos(todosList);
  };

  useEffect(() => {
    const user = auth.currentUser;

    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     setIsAuthenticated(true); // User is signed in
    //     loadTodos(); // Load todos when user is authenticated
    //   } else {
    //     setIsAuthenticated(false); // No user is signed in
    //   }
    //   setLoading(false); // Set loading to false after checking auth state
    // });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch todos from Firestore when user is authenticated
        const todosRef = collection(db, 'todos');
        const q = query(todosRef, where('userId', '==', user.uid));

        const unsubscribeTodos = onSnapshot(q, (snapshot) => {
          const fetchedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTodos(fetchedTodos);
          console.log('Fetched Todos:', fetchedTodos);

          // Set categories based on fetched todos
          const uniqueCategories = [...new Set(fetchedTodos.map(todo => todo.category))];
          setCategories(uniqueCategories);
        });

        setIsAuthenticated(true); // User is signed in

        // Cleanup subscription on unmount
        return () => unsubscribeTodos();
      } else {
        setIsAuthenticated(false); // No user is signed in
        setTodos([]); // Clear todos
        setCategories([]); // Clear categories
      }
    });

    setLoading(false);

    console.log("isAuthenticated : ", isAuthenticated);

    console.log('Current User:', user);

    // Cleanup auth subscription on unmount
    return () => unsubscribeAuth();
  }, []);


  const addCategory = (category) => {
    // Prevent adding duplicates
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const addTodo = async (text, category) => {
    const user = auth.currentUser; // Get the currently authenticated user
    if (user) {
      try {
        await addDoc(collection(db, 'todos'), {
          text,
          category,
          completed: false,
          userId: user.uid, // Store the user ID with the todo
        });
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };
  
  // const addTodo = async (text, category) => {
  //   try {
  //     const docRef = await addDoc(collection(db, 'todos'), { 
  //       text, 
  //       category, 
  //       completed: false,
  //       uid: auth.currentUser.uid // Optional: associate the todo with the user
  //     });
  //     setTodos([...todos, { id: docRef.id, text, category, completed: false }]);
  //   } catch (e) {
  //     console.error('Error adding todo: ', e);
  //   }
  // };

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

  
  const toggleTodo = async (id) => {
    const todoToToggle = todos.find((todo) => todo.id === id);
    
    if (todoToToggle) {
      const todoRef = doc(db, 'todos', id); // Get the reference to the todo document
      try {
        await updateDoc(todoRef, { completed: !todoToToggle.completed }); // Update the completed status in Firestore
        
        // Optionally update local state after Firestore update
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const deleteTodo = async (id) => {
    try {
      const todoRef = doc(db, 'todos', id); // Get the reference to the todo document
      await deleteDoc(todoRef); // Delete the todo from Firestore
      // Update local state to remove the deleted todo
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error); // Log any errors
    }
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


  // Add this function to toggle show completed
  const handleShowCompletedChange = () => {
    setShowCompleted(!showCompleted);
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


      {/* New Todo Filters Section */}
      <div className="todo-filters">
        <label>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={handleShowCompletedChange}
          />
          <span>Show&nbsp;Completed</span>
        </label>
      </div>

      <TodoInput addTodo={addTodo} addCategory={addCategory} categories={categories} />
      <div className="todo-list-container">
      {categories.map((category) => {
          // Filter todos for the current category
          const filteredTodos = todos.filter(todo => todo.category === category);

          // Check if there are any incomplete todos in this category
          const hasIncompleteTodos = filteredTodos.some(todo => !todo.completed);

          // Only render the TodoList if there are incomplete todos or if the showCompleted option is enabled
          if (hasIncompleteTodos || showCompleted) {
            return (
              <TodoList
                key={category}
                title={category}
                todos={filteredTodos.filter(todo => showCompleted || !todo.completed)} // Filter based on completed status
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
              />
            );
          }
          return null; // Do not render this category if all todos are completed and showCompleted is false
        })}
      </div>
    </div>
  );
};

export default TodoApp;
