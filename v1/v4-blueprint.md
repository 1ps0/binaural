# Therapeutic Frequencies Dashboard v4 Blueprint

## Core Principles
1. Minimalist, maintainable code
2. Single source of truth for state
3. Consistent theming system
4. Optimized event handling
5. Mobile-first responsive design

## Architecture

### 1. State Management
```javascript
const AppState = {
  audio: {
    context: null,
    oscillators: {},
    gainNodes: {},
    masterGain: null,
    volume: 0.2
  },
  ui: {
    theme: 'light',
    view: 'cards',
    controlBar: {
      position: 'bottom',
      minimized: false
    }
  },
  frequencies: {
    active: [],
    pinned: {
      binaural: [],
      solfeggio: [],
      special: []
    },
    filter: ''
  }
};
```

### 2. Theme System
```css
:root {
  /* Base colors */
  --color-primary: hsl(220, 100%, 62%);
  --color-secondary: hsl(260, 84%, 57%);
  --color-success: hsl(160, 95%, 43%);
  --color-danger: hsl(358, 85%, 54%);
  
  /* Theme tokens */
  --bg: var(--light-bg);
  --text: var(--light-text);
  --card-bg: var(--light-card-bg);
  /* etc... */
}

[data-theme="dark"] {
  --bg: var(--dark-bg);
  --text: var(--dark-text);
  --card-bg: var(--dark-card-bg);
  /* etc... */
}
```

### 3. Event System
```javascript
const EventSystem = {
  handlers: {},
  
  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  },
  
  emit(event, data) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(data));
    }
  }
};
```

## Implementation Plan

### Phase 1: Core Structure
1. Create base HTML with semantic structure
2. Implement theme system
3. Set up state management
4. Create event system

### Phase 2: Audio System
1. Implement Web Audio API wrapper
2. Create frequency generators
3. Add volume control
4. Implement binaural beat generation

### Phase 3: UI Components
1. Create card/list view components
2. Implement control bar
3. Add frequency filters
4. Create pin system

### Phase 4: Mobile & Responsive
1. Implement mobile-first layouts
2. Add touch controls
3. Optimize control bar for mobile
4. Test across devices

## Key Features

### 1. View System
- Card view for visual browsing
- List view for efficient scanning
- Smooth transitions between views
- Consistent controls in both views

### 2. Control Bar
- Fixed position (top/bottom)
- Minimizable
- Contains:
  - Volume control
  - View toggle
  - Filter input
  - Quick actions

### 3. Frequency Cards
- Unified design for all frequency types
- Clear visual hierarchy
- Efficient pin system
- Responsive layout

### 4. Theme System
- Light/dark modes
- Consistent color tokens
- Smooth transitions
- Accessible contrast ratios

## Testing Strategy

1. Unit Tests
- Audio generation
- State management
- Event system
- Theme system

2. Integration Tests
- View transitions
- Audio controls
- Pin system
- Filter system

3. Mobile Testing
- Touch interactions
- Responsive layouts
- Performance
- Audio behavior

## Migration Plan

1. Create new v4 files
2. Implement core systems
3. Port features from v3
4. Test and validate
5. Replace v3 with v4

## Best Practices

1. HTML
- Semantic markup
- Accessibility attributes
- Progressive enhancement
- Valid HTML5

2. CSS
- Mobile-first
- BEM naming
- CSS custom properties
- Minimal specificity

3. JavaScript
- Event delegation
- Async/await
- Error boundaries
- Performance optimization

## Release Checklist

1. Core Features
- [ ] Audio system working
- [ ] Theme system complete
- [ ] View system working
- [ ] Control bar functional

2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Mobile testing complete
- [ ] Browser testing complete

3. Documentation
- [ ] Code comments
- [ ] API documentation
- [ ] Usage guide
- [ ] Deployment guide 