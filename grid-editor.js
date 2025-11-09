class GridEditor {
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

        this.setupEventListeners();
        this.loadConfiguration();
    }

    setupEventListeners() {
        this.editModeToggle.addEventListener('click', () => this.toggleEditMode());
        
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
            }
        }
    }

    handleResize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.initialX;
        const baseRemInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const deltaRems = Math.round(deltaX / baseRemInPixels);
        
        // Get current span
        const currentSpan = parseInt(this.currentColumn.style.gridColumn.split(' ')[1]) || 10;
        // Calculate new span based on delta
        const newSpan = Math.max(1, currentSpan + deltaRems);
        
        this.currentColumn.style.gridColumn = `span ${newSpan}`;
        this.initialX = e.clientX; // Reset initial X to allow for continuous resizing
    }

    stopDraggingOrResizing() {
        if (this.currentColumn) {
            this.currentColumn.classList.remove('dragging', 'resizing');
        }
        this.isDragging = false;
        this.isResizing = false;
        this.currentColumn = null;
    }

    saveConfiguration() {
        const config = {};
        const columns = this.container.querySelectorAll('.column');
        
        columns.forEach((column, index) => {
            const columnSpan = column.style.gridColumn ? 
                parseInt(column.style.gridColumn.split(' ')[1]) : 
                1;
            
            config[index] = {
                order: index,
                span: columnSpan
            };
        });

        this.columnConfig = config;
        localStorage.setItem('gridConfiguration', JSON.stringify(config));
    }

    loadConfiguration() {
        const savedConfig = localStorage.getItem('gridConfiguration');
        const columns = this.container.querySelectorAll('.column');
        
        if (savedConfig) {
            try {
                this.columnConfig = JSON.parse(savedConfig);
                columns.forEach((column, index) => {
                    if (this.columnConfig[index]) {
                        const { span } = this.columnConfig[index];
                        column.style.gridColumn = `span ${span}`;
                    } else {
                        column.style.gridColumn = 'span 10'; // Default span
                    }
                });
            } catch (error) {
                console.error('Error loading grid configuration:', error);
                this.setDefaultColumnSpans(columns);
            }
        } else {
            this.setDefaultColumnSpans(columns);
        }
    }

    setDefaultColumnSpans(columns) {
        columns.forEach(column => {
            column.style.gridColumn = 'span 10'; // Default span
        });
    }
}

// Initialize the grid editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GridEditor();
});