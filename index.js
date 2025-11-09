document.addEventListener(
    "DOMContentLoaded",
    () => {
        
        // Function to generate unique button ID
        function generateButtonId() {
            return 'add-note-' + Math.random().toString(36).substr(2, 9);
        }

        function createColumn(title, items = []) {
            const column = document.createElement("div");
            column.className = "column";
            
            const list = document.createElement("ul");

            //add title to front
            if (title) {
                items = items.unshift({content: title});
            }

            // Create first note with delete button
            const firstItem = document.createElement("li");
            const firstNoteDiv = document.createElement("div");
            const firstNoteContent = document.createElement("div");
            firstNoteContent.className = "note-content";
            
            // Add delete button
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete";
            deleteButton.title = "Delete Column";
            deleteButton.textContent = "×";
            deleteButton.addEventListener("click", () => {
                if (confirm("Are you sure you want to delete this column?")) {
                    column.remove();
                    saveData();
                }
            });
            
            // Add note content
            const p = document.createElement("p");
            p.textContent = items.length > 0 ? items[0].content : "New Column";
            firstNoteContent.appendChild(p);
            
            firstNoteDiv.appendChild(firstNoteContent);
            firstNoteDiv.appendChild(deleteButton);
            firstItem.appendChild(firstNoteDiv);
            list.appendChild(firstItem);
            
            // Add remaining notes to the list
            for (let i = 1; i < items.length; i++) {
                const listItem = document.createElement("li");
                const noteDiv = document.createElement("div");
                const p = document.createElement("p");
                p.textContent = items[i].content;
                noteDiv.appendChild(p);
                listItem.appendChild(noteDiv);
                list.appendChild(listItem);
            }

            // Create add button list item
            const addButtonLi = document.createElement("li");
            const addButton = document.createElement("button");
            const buttonId = generateButtonId();
            addButton.id = buttonId;
            addButton.className = "add";
            addButton.title = "Add New Note";
            addButton.textContent = "+ Add Note";
            addButtonLi.appendChild(addButton);
            list.appendChild(addButtonLi);
            
            // Add click handler for the add button
            addButton.addEventListener("click", () => {
                const noteText = prompt("Enter your note:", "New note");
                if (noteText) {
                    const newNote = document.createElement("li");
                    const noteDiv = document.createElement("div");
                    const p = document.createElement("p");
                    p.textContent = noteText;
                    noteDiv.appendChild(p);
                    newNote.appendChild(noteDiv);
                    list.insertBefore(newNote, addButtonLi);
                    saveData();
                }
            });
            
            column.appendChild(list);
            return column;
        }

        // Create default column if none exists
        const container = document.querySelector(".container");
        if (!container.querySelector(".column")) {
            const defaultColumn = createColumn();
            container.appendChild(defaultColumn);
        }

        const addColumnBtn = document.getElementById("add-column-button");

        addColumnBtn.addEventListener("click", () => {
            //Ask for a first item, that will be a header
            const headerText = prompt("Enter header text:", "New Column");
            const newColumn = createColumn(headerText);
            const container = document.querySelector('.container');
            container.appendChild(newColumn);
            saveData();
        });

        // Function to save data to localStorage
        function saveData() {
            const columns = document.querySelectorAll('.column');
            const columnsData = [];
            
            columns.forEach(column => {
                const notes = [];
                const listItems = column.querySelectorAll('li');
                
                // Get all notes except the last item (add button)
                for (let i = 0; i < listItems.length - 1; i++) {
                    const note = listItems[i];
                    notes.push({
                        content: note.querySelector('p').textContent
                    });
                }
                
                columnsData.push({
                    notes: notes,
                    buttonId: column.querySelector('button').id
                });
            });

            localStorage.setItem('columnsData', JSON.stringify(columnsData));
        }

        // Function to load data from localStorage and display it
        function loadData() {
            const savedData = localStorage.getItem('columnsData');
            if (savedData) {
                const columnsData = JSON.parse(savedData);
                const container = document.querySelector('.container');
                
                // Clear existing columns
                container.querySelectorAll('.column').forEach(col => col.remove());

                columnsData.forEach(columnData => {
                    const newCol = createColumn(columnData.notes);
                    container.appendChild(newCol);
                });
            } else {
                // Create default column if no data exists
                const defaultColumn = createColumn();
                container.appendChild(defaultColumn);
            }
        }

        // Load data on page load
        loadData();
    },
);
