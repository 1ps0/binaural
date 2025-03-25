# Binaural Beats & Tones

A web-based application for generating binaural beats, solfeggio frequencies, aleph patterns, and other therapeutic tones. Built with modular JavaScript and the Web Audio API.

## Features

- 🎵 Generate binaural beats and Tones
- 🌓 Light/Dark theme support
- 📱 Responsive design for all devices
- 🎚️ Precise volume control
- 📌 Pin favorite frequencies
- 🔍 Search and filter frequencies
- 📋 List and card views
- 🔄 Stackable audio modules
- 🎧 Real-time frequency monitoring
- 🔋 Memory-efficient for long sessions
- 🔄 Works across all modern browsers
- 🔊 Built-in audio clipping prevention
- 📊 Automatic device capability detection
- 🧠 Advanced mathematical Aleph patterns
- 🚀 Dynamic performance adjustments

## Getting Started

### Running Locally

1. **Desktop**: Simply drag `index.html` into any modern browser (Chrome, Firefox, Safari, Edge)
2. **iOS**: Save to Files app and open with Safari
3. **Android**: Open with Chrome from Downloads

### For Developers

If you want to modify the source code:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project:
   - Development: `npm run build`
   - Production: `npm run build:prod`
4. The compiled application will be in the `dist` directory

### Using Headphones

For binaural beats to work effectively, stereo headphones are required. The effect is created by playing slightly different frequencies in each ear.

## Usage

### Basic Controls

- **Play/Stop**: Click the play button on any frequency card
- **Volume**: Use the slider in the control bar
- **Theme**: Toggle light/dark theme with the moon/sun icon
- **View**: Switch between list and card views
- **Search**: Use the search bar to find frequencies
- **Pin**: Save frequencies for quick access

### Frequency Categories

- **Focus**: Beta and Gamma frequencies for concentration
- **Meditation**: Theta frequencies for deep states
- **Sleep**: Delta frequencies for rest
- **Relaxation**: Alpha frequencies for calm
- **Healing**: Solfeggio and special frequencies
- **Transcendental**: Aleph mathematical patterns for advanced states

### Advanced Features

- **Combined Patterns**: Stack different audio techniques together
- **Aleph Frequencies**: Experience mathematical infinity patterns
- **Solfeggio Tuning**: Traditional healing frequency system
- **Resource Management**: Optimized for long listening sessions
- **Dynamic Quality**: Automatically adjusts based on your device capabilities

## Technical Architecture

The application uses a modular architecture with several key systems:

- **AudioSystem**: Core audio generation with WebAudio API
- **Audio Modules**: Stackable components for different sound techniques
  - Carrier: Base frequency generation
  - Binaural: Creates beating effects between ears
  - Solfeggio: Applies traditional healing frequencies
  - Aleph: Generates mathematical pattern matrices
- **FrequencySystem**: Manages frequency data and preferences
- **UISystem**: Handles interface rendering and interaction
- **EventSystem**: Coordinates communication between components
- **Build System**: Combines modules into a single deployable file
- **Memory Management**: Optimizes resource usage and prevents audio glitches

## Browser Compatibility

The application is designed for maximum compatibility across browsers:
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with adaptive quality
- Older browsers: Basic functionality supported if Web Audio API is available

## Development

### Project Structure

```
src/
├── styles/
│   ├── base.css          # Core variables and layout
│   ├── components.css    # UI component styles
│   └── responsive.css    # Media queries and mobile styles
├── js/
│   ├── core/
│   │   ├── state.js      # Application state
│   │   ├── events.js     # Event system
│   │   └── theme.js      # Theme management
│   ├── audio/
│   │   ├── audio-system.js        # Core audio engine
│   │   ├── modules/               # Audio modules
│   │   │   ├── carrier.js         # Base frequency generator
│   │   │   ├── binaural.js        # Binaural beat generator
│   │   │   ├── solfeggio.js       # Solfeggio frequency system
│   │   │   └── aleph.js           # Mathematical pattern generator
│   ├── data/
│   │   └── frequency-system.js    # Frequency data management
│   └── ui/
│       ├── ui-system.js           # UI rendering system
│       └── components.js          # Reusable UI components
└── index.html            # Main HTML template
```

### Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans.

### Contributing

This project is an exercise in AI-assisted development with a focus on carefully crafted, high-quality contributions. Before contributing, please read our:

- [Contributing Guidelines](CONTRIBUTING.md) for detailed instructions on the contribution process
- [Code of Conduct](CODE_OF_CONDUCT.md) for community standards

Key contribution steps:

1. Review [BLUEPRINT.md](v2/BLUEPRINT.md) for planned features and current priorities
2. Check existing issues in the Issues tab for tasks that need attention
3. Fork the repository and create a descriptive feature branch
4. Make your changes following our code standards and architecture
5. Thoroughly test across multiple browsers and devices
6. Submit a Pull Request with comprehensive documentation of your changes

We welcome contributions that align with our project philosophy of purposeful, AI-assisted development with human oversight.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Web Audio API
- Modern browser capabilities
- Scientific research on brainwave entrainment
- Traditional healing frequency systems
- Mathematical set theory concepts for Aleph patterns
