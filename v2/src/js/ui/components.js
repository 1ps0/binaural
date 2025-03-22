/**
 * UI Components
 * Reusable UI component templates and utilities
 */

// UI Components - Reusable templates and utilities
const UIComponents = {
    // Create a button component
    createButton({ text, className, icon, ariaLabel, dataAttributes = {} }) {
        const dataAttrs = Object.entries(dataAttributes)
            .map(([key, value]) => `data-${key}="${value}"`)
            .join(' ');
            
        return `
            <button class="${className}" ${ariaLabel ? `aria-label="${ariaLabel}"` : ''} ${dataAttrs}>
                ${icon ? icon : ''}
                ${text}
            </button>
        `;
    },
    
    // Create a card component
    createCard({ title, body, footer, className = '', dataAttributes = {} }) {
        const dataAttrs = Object.entries(dataAttributes)
            .map(([key, value]) => `data-${key}="${value}"`)
            .join(' ');
            
        return `
            <div class="card ${className}" ${dataAttrs}>
                ${title ? `<div class="card__header">${title}</div>` : ''}
                ${body ? `<div class="card__body">${body}</div>` : ''}
                ${footer ? `<div class="card__footer">${footer}</div>` : ''}
            </div>
        `;
    },
    
    // Create a badge component
    createBadge({ text, type, className = '' }) {
        return `<span class="badge badge--${type} ${className}">${text}</span>`;
    },
    
    // Create a toast notification (requires additional JS to show/hide)
    createToast({ message, type = 'info', duration = 3000 }) {
        const id = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast__content">${message}</div>
            <button class="toast__close">×</button>
        `;
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Add event listener for close button
        const closeBtn = toast.querySelector('.toast__close');
        const closeHandler = () => {
            toast.classList.add('toast--hiding');
            setTimeout(() => {
                toast.remove();
            }, 300); // Match CSS transition time
        };
        closeBtn.addEventListener('click', closeHandler);
        
        // Auto-remove after duration
        setTimeout(closeHandler, duration);
        
        return id;
    },
    
    // Show a toast notification with message
    showToast(message, type = 'info', duration = 3000) {
        return this.createToast({ message, type, duration });
    },
    
    // Create a modal dialog
    createModal({ title, content, actions = [], id, className = '' }) {
        const modal = document.createElement('div');
        modal.id = id || `modal-${Date.now()}`;
        modal.className = `modal ${className}`;
        
        modal.innerHTML = `
            <div class="modal__overlay"></div>
            <div class="modal__container">
                <div class="modal__header">
                    <h2 class="modal__title">${title}</h2>
                    <button class="modal__close" aria-label="Close modal">×</button>
                </div>
                <div class="modal__content">
                    ${content}
                </div>
                ${actions.length > 0 ? `
                    <div class="modal__actions">
                        ${actions.map(action => this.createButton(action)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add to DOM but hidden
        document.body.appendChild(modal);
        
        // Setup event handlers
        const closeBtn = modal.querySelector('.modal__close');
        const overlay = modal.querySelector('.modal__overlay');
        
        const closeModal = () => {
            modal.classList.remove('modal--visible');
            setTimeout(() => {
                modal.remove();
            }, 300); // Match CSS transition time
        };
        
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        // Attach close method to modal
        modal.close = closeModal;
        
        // Show method
        modal.show = () => {
            // Small delay to allow browser to process DOM addition
            setTimeout(() => {
                modal.classList.add('modal--visible');
            }, 10);
        };
        
        return modal;
    },
    
    // Show a confirmation dialog
    confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
        const modal = this.createModal({
            title,
            content: `<p>${message}</p>`,
            actions: [
                {
                    text: cancelText,
                    className: 'btn btn--secondary',
                    dataAttributes: { action: 'cancel' }
                },
                {
                    text: confirmText,
                    className: 'btn btn--primary',
                    dataAttributes: { action: 'confirm' }
                }
            ],
            className: 'modal--confirm'
        });
        
        // Set up action handlers
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        const cancelBtn = modal.querySelector('[data-action="cancel"]');
        
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            modal.close();
        });
        
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            modal.close();
        });
        
        // Show the modal
        modal.show();
        
        return modal;
    }
};

// Export the UIComponents object if in a module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIComponents };
}
