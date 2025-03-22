# Binaural Beats & Healing Frequencies

A web-based application for generating binaural beats, solfeggio frequencies, aleph patterns, and other therapeutic tones. Built with modular JavaScript and the Web Audio API.

## Features

- 🎵 Generate binaural beats and healing frequencies
- 🧠 Advanced mathematical Aleph patterns
- 🌓 Light/Dark theme support
- 📱 Responsive design for all devices
- 🎚️ Precise volume control
- 📌 Pin favorite frequencies
- 🔍 Search and filter frequencies
- 📋 List and card views
- 🔄 Stackable audio modules
- 🎧 Real-time frequency monitoring
- 🔋 Memory-efficient for long sessions

## Getting Started

### Running Locally

1. **Desktop**: Simply drag `index.html` into Chrome/Edge
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

### For AudioWorklet Users

The application uses AudioWorklet for advanced pattern generation. This provides better performance and more complex patterns but requires a modern browser.

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
│   │   └── worklets/
│   │       └── aleph-processor.js # Advanced pattern processor
│   ├── data/
│   │   └── frequency-system.js    # Frequency data management
│   └── ui/
│       ├── ui-system.js           # UI rendering system
│       └── components.js          # Reusable UI components
└── index.html            # Main HTML template
```

### Roadmap

See [BLUEPRINT.md](BLUEPRINT.md) for detailed development plans.

### Contributing

1. Check the [BLUEPRINT.md](BLUEPRINT.md) for planned features
2. Review current issues in the Issues tab
3. Fork the repository and create a feature branch
4. Make your changes and run the build process
5. Submit a Pull Request with your changes

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Web Audio API and AudioWorklet
- Modern browser capabilities
- Scientific research on brainwave entrainment
- Traditional healing frequency systems
- Mathematical set theory concepts for Aleph patterns
