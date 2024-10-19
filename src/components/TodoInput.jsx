import React, { useState } from 'react';

const TodoInput = ({ addTodo, addCategory, categories }) => {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAddTodo = () => {
    if (text.trim() === '') {
      return; // Early exit if text is empty
    }

    let categoryToAdd = selectedCategory;
    
    // Check if new category is being added
    if (selectedCategory === 'new-category' && newCategory.trim() !== '') {
      // Call the addCategory function to store the new category
      addCategory(newCategory);
      categoryToAdd = newCategory; // Use the new category for the todo
      setNewCategory(''); // Clear the new category input
    }

    // Call the addTodo function to add the todo item
    addTodo(text, categoryToAdd);
    setText(''); // Clear the todo text input
    setSelectedCategory(''); // Reset selected category
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
