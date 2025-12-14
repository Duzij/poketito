document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Function to generate unique button ID
        function generateButtonId() {
            return 'add-note-' + Math.random().toString(36).substr(2, 9);
        }

        function generateColumnId() {
            return 'col-' + Math.random().toString(36).substr(2, 9);
        }

        function createColumn(columnId, title, items = [], span = GridEditor.DEFAULT_COLUMN_SPAN, order = null) {
            const column = document.createElement("div");
            column.dataset.columnId = columnId ?? generateColumnId();
            if (order !== null) {
                column.dataset.order = order;
            }
            column.className = "column";
            column.style.gridColumn = "span " + span;
            const list = document.createElement("ul");

            // Handle title as the first item
            const hasTitle = title && (!items.length || items[0].content !== title);
            if (hasTitle) {
                items.unshift({ content: title, isTitle: true });
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
                currentNoteList = list;
                currentAddButtonLi = addButtonLi;
                newNoteContentInput.value = "";
                newNoteDialog.showModal();
                newNoteContentInput.select();
            });

            column.appendChild(list);
            return column;
        }

        // Create default column if none exists
        const container = document.querySelector(".container");

        const addColumnBtn = document.getElementById("add-column-button");

        const newColumnDialog = document.getElementById("new-column-dialog");
        const newColumnTitleInput = document.getElementById("new-column-title");

        const newNoteDialog = document.getElementById("new-note-dialog");
        const newNoteContentInput = document.getElementById("new-note-content");
        let currentNoteList = null;
        let currentAddButtonLi = null;

        addColumnBtn.addEventListener("click", () => {
            newColumnTitleInput.value = "New Column";
            newColumnDialog.showModal();
            newColumnTitleInput.select();
        });

        newColumnDialog.addEventListener('close', () => {
            if (newColumnDialog.returnValue === 'save') {
                const headerText = newColumnTitleInput.value;
                if (headerText) {
                    const existingColumns = document.querySelectorAll('.column');
                    let maxOrder = -1;
                    existingColumns.forEach(col => {
                        const o = parseInt(col.dataset.order || -1);
                        if (o > maxOrder) maxOrder = o;
                    });
                    const nextOrder = maxOrder + 1;

                    const newColumn = createColumn(null, headerText, [], GridEditor.DEFAULT_COLUMN_SPAN, nextOrder);
                    const container = document.querySelector('.container');
                    container.appendChild(newColumn);
                    saveData();
                }
            }
        });

        newNoteDialog.addEventListener('close', () => {
            if (newNoteDialog.returnValue === 'save') {
                const noteText = newNoteContentInput.value;
                if (noteText && currentNoteList && currentAddButtonLi) {
                    const newNote = document.createElement("li");
                    const noteDiv = document.createElement("div");
                    const p = document.createElement("p");
                    p.textContent = noteText;
                    noteDiv.appendChild(p);
                    newNote.appendChild(noteDiv);
                    currentNoteList.insertBefore(newNote, currentAddButtonLi);
                    saveData();
                }
            }
            // Cleanup state
            currentNoteList = null;
            currentAddButtonLi = null;
        });

        // Function to save data to localStorage
        function saveData() {
            const columns = document.querySelectorAll('.column');
            const data = {};

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

                // Get title from the first note
                const title = notes.length > 0 ? notes[0].content : '';
                const regularNotes = notes.slice(1);

                data[column.getAttribute('data-column-id')] = {
                    columnId: column.getAttribute('data-column-id'),
                    title: title,
                    notes: regularNotes,
                    order: parseInt(column.dataset.order || -1),
                    span: parseInt(column.style.gridColumn.replace('span ', '')) || GridEditor.DEFAULT_COLUMN_SPAN
                };
            });

            console.log("saving", data)
            localStorage.setItem('columnsData', JSON.stringify(data));
        }

        // Function to load data from localStorage and display it
        function loadData() {
            const savedData = localStorage.getItem('columnsData');
            if (savedData) {
                const columnsData = JSON.parse(savedData);
                const container = document.querySelector('.container');

                // Clear existing columns
                container.querySelectorAll('.column').forEach(col => col.remove());

                Object.keys(columnsData)
                    .sort((a, b) => columnsData[a].order - columnsData[b].order)
                    .forEach(columnId => {
                        const columnData = columnsData[columnId];
                        const newCol = createColumn(columnId, columnData.title, columnData.notes, columnData.span, columnData.order);
                        console.log("Created column:", newCol, columnData);
                        container.appendChild(newCol);
                    });
            } else {
                const defaultColumn = createColumn();
                container.appendChild(defaultColumn);
            }
        }

        // Load data on page load
        loadData();
    },
);
