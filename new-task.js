document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newTaskForm');
  const taskNameInput = document.getElementById('taskName');
  const taskContentInput = document.getElementById('taskContent');

  // Function to handle automatic dot insertion
  function handleDotInsertion(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const cursorPos = taskContentInput.selectionStart;
      const content = taskContentInput.value;
      const beforeCursor = content.substring(0, cursorPos);
      const afterCursor = content.substring(cursorPos);

      // Add new line with dot
      taskContentInput.value = beforeCursor + '\n• ' + afterCursor;
      
      // Move cursor after the dot
      taskContentInput.selectionStart = cursorPos + 3;
      taskContentInput.selectionEnd = cursorPos + 3;
    }
  }

  // Add dot to first line when focused if empty
  taskContentInput.addEventListener('focus', () => {
    if (!taskContentInput.value) {
      taskContentInput.value = '• ';
      taskContentInput.selectionStart = 2;
      taskContentInput.selectionEnd = 2;
    }
  });

  // Handle keypress for new lines
  taskContentInput.addEventListener('keydown', handleDotInsertion);

  // Handle paste event to add dots to pasted content
  taskContentInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const lines = pastedText.split('\n');
    const formattedText = lines.map(line => line.trim()).map(line => {
      // Don't add dot if line already starts with one
      if (line.startsWith('•')) return line;
      return line ? '• ' + line : line;
    }).join('\n');

    const cursorPos = taskContentInput.selectionStart;
    const content = taskContentInput.value;
    const beforeCursor = content.substring(0, cursorPos);
    const afterCursor = content.substring(cursorPos);

    taskContentInput.value = beforeCursor + formattedText + afterCursor;
    
    // Move cursor to end of pasted text
    const newPosition = cursorPos + formattedText.length;
    taskContentInput.selectionStart = newPosition;
    taskContentInput.selectionEnd = newPosition;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const taskName = taskNameInput.value.trim();
    const taskContent = taskContentInput.value.trim();

    if (!taskName) {
      taskNameInput.focus();
      return;
    }

    // Get existing todos
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');

    // Create new todo
    const newTodo = {
      id: Date.now(),
      name: taskName,
      content: taskContent,
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Add new todo to array
    todos.push(newTodo);

    // Save back to localStorage
    localStorage.setItem('todos', JSON.stringify(todos));

    // Redirect back to main page
    window.location.href = 'do.html';
  });

  // Focus on task name input when page loads
  taskNameInput.focus();
});
