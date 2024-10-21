import React, { useState } from 'react';

const TodoInput = ({ handleAddList }) => {
  const [newList, setNewList] = useState('');

  const onAddList = () => {
    if (newList.trim() !== '') {
      handleAddList(newList);
      setNewList(''); // Clear input field after adding
    }
  };

  return (
    <div className="todo-input">
      <input
        type="text"
        placeholder="New category name..."
        value={newList}
        onChange={(e) => setNewList(e.target.value)}
      />
      <button onClick={onAddList}>Add New List</button>
    </div>
  );
};

export default TodoInput;
