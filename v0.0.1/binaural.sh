#!/bin/bash
#
# macOS Therapeutic Frequencies Script (Final Version)
# Author: Claude
# Date: March 2025
#
# Description:
# This script plays various therapeutic frequencies including binaural beats,
# brainwave frequencies, Solfeggio tones, and other healing frequencies.
#
# Requirements:
# - Sox (Sound eXchange) must be installed on macOS
# - Install with: brew install sox
#
# Usage:
# ./frequencies.sh [MODE] [FREQUENCY] [OPTIONS]
#

# Default values
DEFAULT_VOLUME=0.2    # 20% volume for comfortable listening
DEFAULT_FREQ=40       # Default frequency (cognitive enhancement)
DEFAULT_CARRIER=200   # Default carrier frequency
DEFAULT_DURATION=600  # 10 minutes (use Ctrl+C to stop earlier)
TEST_DURATION=5       # 5 seconds for test mode

# Check for sox dependency
if ! command -v sox &> /dev/null; then
    echo "Error: This script requires SoX (Sound eXchange) to be installed."
    echo "Install with: brew install sox"
    exit 1
fi

# Function to display help information
function show_help {
    echo "=== macOS Therapeutic Frequencies Script ==="
    echo
    echo "This script plays various therapeutic frequencies including binaural beats,"
    echo "brainwave frequencies, Solfeggio tones, and other healing frequencies."
    echo
    echo "Usage:"
    echo "  $0 [MODE] [FREQUENCY/PRESET] [OPTIONS]"
    echo
    echo "Modes:"
    echo "  binaural [FREQ] [CARRIER] [VOLUME]   Play binaural beat"
    echo "  tone [FREQ] [VOLUME]                 Play pure tone"
    echo "  solfeggio [FREQ] [VOLUME]            Play Solfeggio frequency"
    echo "  preset [NAME]                        Play predefined preset"
    echo "  test                                 Test various frequencies (5s each)"
    echo "  list                                 List all available presets"
    echo "  info [preset|wave|solfeggio]         Show information about frequencies"
    echo
    echo "Examples:"
    echo "  $0 binaural 40                       # Play 40Hz binaural beat"
    echo "  $0 binaural 40 300 0.15              # 40Hz beat, 300Hz carrier, 15% volume"
    echo "  $0 tone 432 0.2                      # Play 432Hz pure tone at 20% volume"
    echo "  $0 solfeggio 528                     # Play 528Hz MI Solfeggio frequency"
    echo "  $0 preset meditate                   # Play meditation preset"
    echo "  $0 preset focus                      # Play focus preset"
    echo "  $0 test                              # Showcase various frequencies (5s each)"
    echo "  $0 test 0.3                          # Test frequencies at 30% volume"
    echo
    echo "Notes:"
    echo "  - For binaural beats, use headphones for the proper effect"
    echo "  - Volume is a value between 0.0 and 1.0 (0.2 = 20% volume)"
    echo "  - Press Ctrl+C to stop playback at any time"
}

# Function to display available presets
function show_presets {
    echo "=== Available Frequency Presets ==="
    echo
    echo "Brainwave States:"
    echo "  sleep        - Deep sleep, delta waves (3Hz)"
    echo "  heal         - Healing, pain relief (2.5Hz)"
    echo "  meditate     - Meditation, theta waves (6Hz)"
    echo "  creative     - Creative inspiration (7.5Hz)"
    echo "  dream        - Dream state, REM sleep (4.5Hz)"
    echo "  relax        - Relaxed alertness, alpha (10Hz)"
    echo "  learn        - Learning enhancement (12Hz)"
    echo "  focus        - Focus, concentration (15Hz)"
    echo "  alert        - Alertness, problem-solving (18Hz)"
    echo "  think        - Analytical thinking (25Hz)"
    echo "  clarity      - Mental clarity (35Hz)"
    echo "  cognitive    - Cognitive enhancement (40Hz)"
    echo
    echo "Solfeggio Frequencies:"
    echo "  solfeggio-ut    - Liberating guilt and fear (396Hz)"
    echo "  solfeggio-re    - Undoing situations, change (417Hz)"
    echo "  solfeggio-mi    - Transformation, DNA repair (528Hz)"
    echo "  solfeggio-fa    - Connecting relationships (639Hz)"
    echo "  solfeggio-sol   - Awakening intuition (741Hz)"
    echo "  solfeggio-la    - Returning to spiritual order (852Hz)"
    echo
    echo "Special Frequencies:"
    echo "  schumann      - Earth's resonance (7.83Hz)"
    echo "  freq-432      - Universal harmony (432Hz)"
    echo "  freq-111      - Cell regeneration (111Hz)"
    echo "  freq-963      - Higher consciousness (963Hz)"
}

# Function to play a pure tone
function play_tone {
    local FREQ=${1:-$DEFAULT_FREQ}
    local VOLUME=${2:-$DEFAULT_VOLUME}
    
    echo "Playing a pure ${FREQ}Hz tone at ${VOLUME} volume"
    echo "Press Ctrl+C to stop playback"
    
    # Using the working approach from tests
    local PLAY_DURATION=${4:-$DEFAULT_DURATION}
    sox -n -d synth $PLAY_DURATION sine $FREQ fade 1 0 0 vol $VOLUME
}

# Function to play a binaural beat
function play_binaural {
    local BEAT_FREQ=${1:-$DEFAULT_FREQ}
    local CARRIER=${2:-$DEFAULT_CARRIER}
    local VOLUME=${3:-$DEFAULT_VOLUME}
    local LEFT=$CARRIER
    local RIGHT=$(echo "$CARRIER + $BEAT_FREQ" | bc)
    
    echo "Playing a ${BEAT_FREQ}Hz binaural beat"
    echo "Left ear: ${LEFT}Hz, Right ear: ${RIGHT}Hz, Volume: ${VOLUME}"
    echo "For binaural effect, please use headphones!"
    echo "Press Ctrl+C to stop playback"
    
    local PLAY_DURATION=${4:-$DEFAULT_DURATION}
    # Using the working approach from tests
    sox -n -d synth $PLAY_DURATION sine $LEFT sine $RIGHT fade 1 0 0 vol $VOLUME
}

# Function to play a preset based on its name
function play_preset {
    local PRESET=$1
    local VOLUME=${2:-$DEFAULT_VOLUME}
    local PLAY_DURATION=${3:-$DEFAULT_DURATION}
    
    case $PRESET in
        # Brainwave states
        sleep)
            echo "Playing Sleep Preset - Deep sleep, delta waves (3Hz binaural beat)"
            play_binaural 3 200 $VOLUME $PLAY_DURATION
            ;;
        heal)
            echo "Playing Healing Preset - Pain relief, healing (2.5Hz binaural beat)"
            play_binaural 2.5 200 $VOLUME $PLAY_DURATION
            ;;
        meditate)
            echo "Playing Meditation Preset - Theta waves (6Hz binaural beat)"
            play_binaural 6 200 $VOLUME $PLAY_DURATION
            ;;
        creative)
            echo "Playing Creative Preset - Creative inspiration (7.5Hz binaural beat)"
            play_binaural 7.5 200 $VOLUME $PLAY_DURATION
            ;;
        dream)
            echo "Playing Dream State Preset - REM sleep (4.5Hz binaural beat)"
            play_binaural 4.5 200 $VOLUME $PLAY_DURATION
            ;;
        relax)
            echo "Playing Relaxation Preset - Alpha waves (10Hz binaural beat)"
            play_binaural 10 200 $VOLUME $PLAY_DURATION
            ;;
        learn)
            echo "Playing Learning Preset - Information processing (12Hz binaural beat)"
            play_binaural 12 200 $VOLUME $PLAY_DURATION
            ;;
        focus)
            echo "Playing Focus Preset - Concentration (15Hz binaural beat)"
            play_binaural 15 200 $VOLUME $PLAY_DURATION
            ;;
        alert)
            echo "Playing Alertness Preset - Problem-solving (18Hz binaural beat)"
            play_binaural 18 200 $VOLUME $PLAY_DURATION
            ;;
        think)
            echo "Playing Analytical Thinking Preset - Beta waves (25Hz binaural beat)"
            play_binaural 25 200 $VOLUME $PLAY_DURATION
            ;;
        clarity)
            echo "Playing Mental Clarity Preset - Gamma waves (35Hz binaural beat)"
            play_binaural 35 200 $VOLUME $PLAY_DURATION
            ;;
        cognitive)
            echo "Playing Cognitive Enhancement Preset - Gamma waves (40Hz binaural beat)"
            play_binaural 40 200 $VOLUME $PLAY_DURATION
            ;;
            
        # Solfeggio frequencies
        solfeggio-ut)
            echo "Playing Solfeggio UT Preset - Liberating guilt and fear (396Hz)"
            play_tone 396 $VOLUME $PLAY_DURATION
            ;;
        solfeggio-re)
            echo "Playing Solfeggio RE Preset - Undoing situations (417Hz)"
            play_tone 417 $VOLUME $PLAY_DURATION
            ;;
        solfeggio-mi)
            echo "Playing Solfeggio MI Preset - Transformation, DNA repair (528Hz)"
            play_tone 528 $VOLUME $PLAY_DURATION
            ;;
        solfeggio-fa)
            echo "Playing Solfeggio FA Preset - Connecting/relationships (639Hz)"
            play_tone 639 $VOLUME $PLAY_DURATION
            ;;
        solfeggio-sol)
            echo "Playing Solfeggio SOL Preset - Awakening intuition (741Hz)"
            play_tone 741 $VOLUME $PLAY_DURATION
            ;;
        solfeggio-la)
            echo "Playing Solfeggio LA Preset - Spiritual order (852Hz)"
            play_tone 852 $VOLUME $PLAY_DURATION
            ;;
            
        # Special frequencies
        schumann)
            echo "Playing Schumann Resonance - Earth's frequency (7.83Hz)"
            play_tone 7.83 $VOLUME $PLAY_DURATION
            ;;
        freq-432)
            echo "Playing 432Hz Frequency - Universal harmony"
            play_tone 432 $VOLUME $PLAY_DURATION
            ;;
        freq-111)
            echo "Playing 111Hz Frequency - Cell regeneration"
            play_tone 111 $VOLUME $PLAY_DURATION
            ;;
        freq-963)
            echo "Playing 963Hz Frequency - Higher consciousness"
            play_tone 963 $VOLUME $PLAY_DURATION
            ;;
            
        *)
            echo "Error: Unknown preset '$PRESET'"
            echo "Use '$0 list' to see available presets"
            exit 1
            ;;
    esac
}

# Function to show information about frequency ranges
function show_info {
    local CATEGORY=$1
    
    case $CATEGORY in
        wave|waves|brainwave|brainwaves)
            echo "=== Brain Wave Frequency Ranges ==="
            echo
            echo "Delta waves (0.5-4 Hz):"
            echo "  - Associated with deep sleep, healing, and rejuvenation"
            echo "  - Helps with pain relief, relaxation, and cortisol reduction"
            echo "  - Best for: sleep disorders, deep healing, stress reduction"
            echo
            echo "Theta waves (4-8 Hz):"
            echo "  - Associated with meditation, creative insight, and REM sleep"
            echo "  - Enhances intuition, learning, and emotional connection"
            echo "  - Best for: meditation, creativity, emotional work"
            echo
            echo "Alpha waves (8-14 Hz):"
            echo "  - Associated with relaxed awareness and light meditation"
            echo "  - Promotes calm focus, learning, and positive thinking"
            echo "  - Best for: anxiety reduction, learning enhancement, relaxation"
            echo
            echo "Beta waves (14-30 Hz):"
            echo "  - Associated with active thinking and focus"
            echo "  - Promotes concentration, alertness, and cognition"
            echo "  - Best for: focus tasks, problem-solving, active working"
            echo
            echo "Gamma waves (30-100 Hz):"
            echo "  - Associated with higher cognitive processing"
            echo "  - Promotes peak awareness, perception, and information processing"
            echo "  - The 40Hz frequency is associated with cognitive benefits"
            echo "  - Best for: advanced cognition, memory, perception enhancement"
            ;;
            
        solfeggio)
            echo "=== Solfeggio Frequencies ==="
            echo
            echo "These frequencies are derived from an ancient musical scale and are"
            echo "believed to have various healing and spiritual properties."
            echo
            echo "396 Hz (UT):"
            echo "  - Liberating guilt and fear"
            echo "  - Helps remove subconscious negative beliefs"
            echo
            echo "417 Hz (RE):"
            echo "  - Undoing situations and facilitating change"
            echo "  - Helps cleanse traumatic experiences"
            echo
            echo "528 Hz (MI):"
            echo "  - Transformation and miracles"
            echo "  - Associated with DNA repair and cellular healing"
            echo "  - Known as the 'Love Frequency'"
            echo
            echo "639 Hz (FA):"
            echo "  - Connecting/relationships"
            echo "  - Enhances understanding, tolerance, and love"
            echo
            echo "741 Hz (SOL):"
            echo "  - Awakening intuition"
            echo "  - Helps with solving problems and expression"
            echo
            echo "852 Hz (LA):"
            echo "  - Returning to spiritual order"
            echo "  - Awakens spiritual awareness and intuition"
            echo
            echo "Extended Solfeggio:"
            echo "  - 174 Hz: Pain reduction, energy"
            echo "  - 285 Hz: Healing tissues, regeneration"
            echo "  - 963 Hz: Awakening perfect state, higher consciousness"
            ;;
            
        preset|presets)
            show_presets
            ;;
            
        *)
            echo "=== Frequency Information ==="
            echo
            echo "This script supports several categories of frequencies:"
            echo
            echo "1. Brainwave frequencies (binaural beats)"
            echo "2. Solfeggio frequencies"
            echo "3. Special healing frequencies"
            echo
            echo "For specific information use one of these commands:"
            echo "  $0 info wave     - Information about brainwave frequencies"
            echo "  $0 info solfeggio - Information about Solfeggio frequencies"
            echo "  $0 info preset   - List all available presets"
            ;;
    esac
}

# Function to run the test mode showcasing frequencies
function run_test_mode {
    local VOLUME=${1:-$DEFAULT_VOLUME}
    
    echo "=== Frequency Test Mode ==="
    echo "Playing 5 seconds of various frequencies to showcase and vet them."
    echo "Volume: $VOLUME"
    echo
    
    # Test key binaural beats
    echo "Testing Binaural Beats..."
    echo "1. 40Hz Binaural (Cognitive Enhancement)"
    play_binaural 40 200 $VOLUME $TEST_DURATION
    sleep 1
    
    echo "2. 6Hz Binaural (Meditation)"
    play_binaural 6 200 $VOLUME $TEST_DURATION
    sleep 1
    
    echo "3. 10Hz Binaural (Relaxation)"
    play_binaural 10 200 $VOLUME $TEST_DURATION
    sleep 1
    
    echo "4. 15Hz Binaural (Focus)"
    play_binaural 15 200 $VOLUME $TEST_DURATION
    sleep 1
    
    # Test key Solfeggio frequencies
    echo
    echo "Testing Solfeggio Frequencies..."
    echo "1. 528Hz (Transformation, DNA Repair)"
    play_tone 528 $VOLUME $TEST_DURATION
    sleep 1
    
    echo "2. 432Hz (Universal Harmony)"
    play_tone 432 $VOLUME $TEST_DURATION
    sleep 1
    
    echo "3. 396Hz (Liberating Guilt and Fear)"
    play_tone 396 $VOLUME $TEST_DURATION
    sleep 1
    
    # Test special frequencies
    echo
    echo "Testing Special Frequencies..."
    echo "1. 7.83Hz (Schumann Resonance - Earth's Frequency)"
    play_tone 7.83 $VOLUME $TEST_DURATION
    sleep 1
    
    echo
    echo "Test complete! Use specific modes to play frequencies for longer durations."
    echo "Example: $0 binaural 40"
}

# Main script execution
case $1 in
    binaural)
        play_binaural ${2:-$DEFAULT_FREQ} ${3:-$DEFAULT_CARRIER} ${4:-$DEFAULT_VOLUME}
        ;;
    tone)
        play_tone ${2:-$DEFAULT_FREQ} ${3:-$DEFAULT_VOLUME}
        ;;
    solfeggio)
        if [[ -z $2 ]]; then
            echo "Error: Please specify a Solfeggio frequency"
            echo "Common values: 396, 417, 528, 639, 741, 852"
            exit 1
        fi
        play_tone $2 ${3:-$DEFAULT_VOLUME}
        ;;
    preset)
        if [[ -z $2 ]]; then
            echo "Error: Please specify a preset name"
            echo "Use '$0 list' to see available presets"
            exit 1
        fi
        play_preset $2 ${3:-$DEFAULT_VOLUME}
        ;;
    test)
        run_test_mode ${2:-$DEFAULT_VOLUME}
        ;;
    list)
        show_presets
        ;;
    info)
        show_info $2
        ;;
    help|-h|--help)
        show_help
        ;;
    "")
        # Default action when no arguments are provided
        echo "macOS Therapeutic Frequencies Script"
        echo
        echo "Please specify a mode to use this script."
        echo "For help, use: $0 help"
        ;;
    *)
        echo "Error: Unknown mode '$1'"
        echo "For help, use: $0 help"
        exit 1
        ;;
esac
