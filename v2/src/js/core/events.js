/**
 * Event System
 * Centralized event management with proper memory handling
 */

// Event System
const EventSystem = {
    handlers: {},
    activeListeners: new Map(), // Track active DOM event listeners for cleanup
    
    /**
     * Register an event handler
     * @param {string} event - Event name
     * @param {function} handler - Event handler function
     * @returns {function} Cleanup function to remove the handler
     */
    on(event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
        return () => this.off(event, handler); // Return cleanup function
    },

    /**
     * Remove an event handler
     * @param {string} event - Event name
     * @param {function} handler - Event handler to remove
     */
    off(event, handler) {
        if (this.handlers[event]) {
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
        }
    },

    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.handlers[event]) {
            this.handlers[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    },

    /**
     * Register a one-time event handler
     * @param {string} event - Event name
     * @param {function} handler - Event handler function
     * @returns {function} Cleanup function
     */
    once(event, handler) {
        const onceHandler = (data) => {
            handler(data);
            this.off(event, onceHandler);
        };
        return this.on(event, onceHandler);
    },
    
    /**
     * Add a DOM event listener with tracking for later cleanup
     * @param {Element} element - DOM element
     * @param {string} eventName - DOM event name
     * @param {function} handler - Event handler
     * @param {object} options - Event listener options
     * @returns {function} Cleanup function
     */
    addDOMListener(element, eventName, handler, options = {}) {
        // Create a unique key for this listener
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        element.addEventListener(eventName, handler, options);
        
        // Store reference for cleanup
        this.activeListeners.set(id, {
            element,
            eventName,
            handler,
            options
        });
        
        // Return cleanup function
        return () => {
            this.removeDOMListener(id);
        };
    },
    
    /**
     * Remove a tracked DOM event listener
     * @param {string} id - Listener ID
     */
    removeDOMListener(id) {
        if (this.activeListeners.has(id)) {
            const { element, eventName, handler, options } = this.activeListeners.get(id);
            element.removeEventListener(eventName, handler, options);
            this.activeListeners.delete(id);
        }
    },
    
    /**
     * Clean up all event handlers
     */
    cleanup() {
        // Clear all custom event handlers
        this.handlers = {};
        
        // Remove all tracked DOM listeners
        this.activeListeners.forEach((listener, id) => {
            this.removeDOMListener(id);
        });
    }
};

// Export the EventSystem object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventSystem };
}
