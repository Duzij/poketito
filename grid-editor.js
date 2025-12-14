class GridEditor {
    static DEFAULT_COLUMN_SPAN = 10;

    constructor() {
        this.container = document.querySelector('.container');
        this.editModeToggle = document.getElementById('edit-mode-button');

        this.isEditMode = false;
        this.isDragging = false;
        this.isResizing = false;
        this.currentColumn = null;
        this.initialX = 0;
        this.initialWidth = 0;
        this.columnConfig = {};
        this.ghostElement = null;
        this.dragOffset = { x: 0, y: 0 };

        // Load configuration first so we have access to existing order numbers
        this.loadConfiguration();
        this.setupEventListeners();

        // Initialize any existing columns that don't have order numbers
        // this.initializeColumnOrders();
    }

    setupEventListeners() {
        this.editModeToggle.addEventListener('click', () => this.toggleEditMode());

        // Observe the container for new columns
        this.observeContainer();

        // Setup column event listeners when edit mode is enabled
        this.container.addEventListener('mousedown', (e) => {
            if (!this.isEditMode) return;

            const column = e.target.closest('.column');
            if (!column) return;

            // Check if clicking resize handle
            const rect = column.getBoundingClientRect();
            const isResizeHandle = (e.clientX > rect.right - 10);
            console.log("isResizeHandle", isResizeHandle);
            if (isResizeHandle) {
                this.startResizing(e, column);
            } else {
                this.startDragging(e, column);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            } else if (this.isResizing) {
                this.handleResize(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging || this.isResizing) {
                this.stopDraggingOrResizing();
            }
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.container.classList.toggle('edit-mode');
        this.editModeToggle.classList.toggle('active');
        this.editModeToggle.textContent = this.isEditMode ? 'Save Layout' : 'Edit Layout';

        if (!this.isEditMode) {
            this.saveConfiguration();
        }
    }

    startDragging(e, column) {
        this.isDragging = true;
        this.currentColumn = column;
        this.initialX = e.clientX;
        column.classList.add('dragging');

        // Create ghost element
        this.ghostElement = column.cloneNode(true);
        this.ghostElement.classList.add('ghost-column');
        this.ghostElement.style.width = `${column.offsetWidth}px`;
        this.ghostElement.style.height = `${column.offsetHeight}px`;

        // Calculate offset from mouse to column edge
        const columnRect = column.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - columnRect.left,
            y: e.clientY - columnRect.top
        };

        // Position ghost element
        this.ghostElement.style.left = `${e.pageX - this.dragOffset.x}px`;
        this.ghostElement.style.top = `${e.pageY - this.dragOffset.y}px`;

        console.log("Starting drag with offset:", this.dragOffset);
        document.body.appendChild(this.ghostElement);
    }

    startResizing(e, column) {
        this.isResizing = true;
        this.currentColumn = column;
        this.initialX = e.clientX;
        this.initialWidth = column.getBoundingClientRect().width;
        column.classList.add('resizing');
    }

    handleDrag(e) {
        if (!this.isDragging) return;

        // Update ghost element position
        if (this.ghostElement) {
            this.ghostElement.style.left = `${e.pageX - this.dragOffset.x}px`;
            this.ghostElement.style.top = `${e.pageY - this.dragOffset.y}px`;
        }

        this.numberOfColumns = this.container.children.length;
        const deltaX = e.clientX - this.initialX;
        const columnWidth = this.container.getBoundingClientRect().width / this.numberOfColumns;
        const shift = Math.round(deltaX / columnWidth);

        if (shift !== 0) {
            const columns = Array.from(this.container.children);
            const currentIndex = columns.indexOf(this.currentColumn);
            const newIndex = Math.max(0, Math.min(columns.length - 1, currentIndex + shift));

            if (newIndex !== currentIndex) {
                const referenceNode = newIndex > currentIndex ? columns[newIndex].nextSibling : columns[newIndex];
                this.container.insertBefore(this.currentColumn, referenceNode);
                this.initialX = e.clientX;

                // Save configuration immediately to preserve the new order
                this.saveConfiguration();
            }
        }
    }

    handleResize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.initialX;
        const baseRemInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);

        if (Math.abs(deltaX) > baseRemInPixels) {

            const deltaRems = Math.round(deltaX / baseRemInPixels);
            console.log("deltaRems", deltaRems);
            // Get current span
            const currentSpan = parseInt(this.currentColumn.style.gridColumn.split(' ')[1]) || GridEditor.DEFAULT_COLUMN_SPAN;

            const newSpan = Math.max(1, currentSpan + (deltaRems > 0 ? 1 : -1));
            this.currentColumn.spanSize = newSpan;
            this.currentColumn.style.gridColumn = `span ${newSpan}`;
            this.initialX = e.clientX; // Reset initial X to allow for continuous resizing
        }
    }

    stopDraggingOrResizing() {
        if (this.currentColumn) {
            this.currentColumn.classList.remove('dragging', 'resizing');
        }

        // Remove ghost element
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }

        this.isDragging = false;
        this.isResizing = false;
        this.currentColumn = null;
    }

    observeContainer() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement && node.classList.contains('column')) {
                            if (!node.dataset.columnId || !node.dataset.order) {
                                this.handleNewColumn(node);
                            }
                        }
                    });
                }
            });
        });

        observer.observe(this.container, { childList: true });
    }

    getNextOrderNumber() {
        let maxOrder = -1;
        Object.values(this.columnConfig || {}).forEach(config => {
            if (config.order > maxOrder) {
                maxOrder = config.order;
            }
        });
        return maxOrder + 1;
    }

    saveConfiguration() {
        // let config = JSON.parse(localStorage.getItem('columnsData'));

        const config = {};
        const columns = Array.from(this.container.querySelectorAll('.column'));

        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];
            const columnId = column.dataset.columnId;
            column.dataset.columnId = columnId;

            const notes = [];
            const listItems = column.querySelectorAll('li');

            // Get all notes except the last item (add button)
            for (let i = 0; i < listItems.length - 1; i++) {
                const note = listItems[i];
                notes.push({
                    content: note.querySelector('p').textContent
                });
            }

            const title = notes.length > 0 ? notes[0].content : '';
            const regularNotes = notes.slice(1);

            config[column.getAttribute('data-column-id')] = {
                title: title,
                notes: regularNotes,
                order: parseInt(column.dataset.order || -1),
                span: parseInt(column.style.gridColumn.replace('span ', '')) || GridEditor.DEFAULT_COLUMN_SPAN
            };
        }

        this.columnConfig = config;
        console.log("saving", config);
        localStorage.setItem('columnsData', JSON.stringify(config));
    }

    generateColumnId() {
        return 'col-' + Math.random().toString(36).substr(2, 9);
    }

    initializeColumnOrders() {
        const columns = Array.from(this.container.querySelectorAll('.column'));
        let nextOrder = this.getNextOrderNumber();

        columns.forEach((column) => {
            if (!column.dataset.columnId || !column.dataset.order) {
                // Initialize new column
                console.log("initializing", column);
                this.initializeNewColumn(column, nextOrder++);
            }
        });
    }

    initializeNewColumn(column, order = null) {
        // Generate new ID if not exists
        if (!column.dataset.columnId) {
            column.dataset.columnId = this.generateColumnId();
        }

        // Assign next order number if not provided
        if (order === null) {
            order = this.getNextOrderNumber();
        }

        column.dataset.order = order.toString();

        // Update configuration
        const columnId = column.dataset.columnId;
        this.columnConfig[columnId] = {
            order: order,
            span: parseInt(column.style.gridColumn?.split(' ')[1]) || GridEditor.DEFAULT_COLUMN_SPAN
        };

        return column;
    }

    // Add a method to handle new columns being added to the container
    handleNewColumn(column) {
        this.initializeNewColumn(column);
        this.saveConfiguration();
        return column;
    }

    loadConfiguration() {
        const savedConfig = localStorage.getItem('columnsData');
        const columns = Array.from(this.container.querySelectorAll('.column'));

        if (savedConfig) {
            try {
                this.columnConfig = JSON.parse(savedConfig);

                // First, assign IDs and spans to columns
                columns.forEach((column, index) => {
                    const columnConfig = this.findColumnConfig(column.dataset.columnId);
                    if (columnConfig) {
                        column.style.gridColumn = `span ${columnConfig.span}`;
                    } else {
                        column.style.gridColumn = `span ${GridEditor.DEFAULT_COLUMN_SPAN}`;
                    }
                });

                // Then reorder columns based on saved order
                columns.sort((col) => {
                    const columnId = col.dataset.columnId;
                    const config = this.findColumnConfig(columnId);
                    return config ? config.order : 999999; // Put columns without config at the end
                }).forEach(col => {
                    console.log("Appending column during load:", col);
                    this.container.appendChild(col);
                });
            } catch (error) {
                console.error('Error loading grid configuration:', error);
                this.setDefaultColumnSpans(columns);
            }
        } else {
            this.setDefaultColumnSpans(columns);
        }
    }

    findColumnConfig(columnId) {
        return this.columnConfig[columnId];
    }

    setDefaultColumnSpans(columns) {
        columns.forEach(column => {
            column.style.gridColumn = 'span ' + GridEditor.DEFAULT_COLUMN_SPAN.toString(); // Default span
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GridEditor();
});