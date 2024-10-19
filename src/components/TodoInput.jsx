// src/components/TodoInput.jsx
import React, { useState } from 'react';

const TodoInput = ({ addTodo, addCategory, categories }) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAddTodo = () => {
    if (text.trim() !== '') {
      let categoryToAdd = selectedCategory;
      if (selectedCategory === 'new-category' && newCategory.trim() !== '') {
        addCategory(newCategory);
        categoryToAdd = newCategory;
        setNewCategory('');
      }
      addTodo(text, categoryToAdd);
      setText('');
      setSelectedCategory('');
    }
  };

  return (
    <div className="todo-input">
      <input
        type="text"
        placeholder="Add a new todo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="" disabled>
          Select a category
        </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
        <option value="new-category">Add new category</option>
      </select>
      {selectedCategory === 'new-category' && (
        <input
          type="text"
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      )}
      <button onClick={handleAddTodo}>Add Todo</button>
    </div>
  );
};

export default TodoInput;
