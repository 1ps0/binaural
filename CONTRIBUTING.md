# Contributing to Binaural Beats & Tones

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code and maintain a respectful, inclusive environment for all contributors.

## Project Philosophy

### Core Principles

This project is fundamentally an exercise in:

- **Purposeful AI-driven development**: Creating useful, targeted code primarily through AI/Generated code
- **Skilled prompt engineering**: Using codegen as a power tool through careful, thoughtful prompting
- **Controlled evolution**: Building features deliberately within the established architecture
- **Quality over quantity**: Prioritizing well-crafted, focused contributions over volume

### What We Don't Accept

The project explicitly rejects:

- **Unfiltered feedback**: Comments or suggestions without careful consideration of project goals
- **Uncurated code changes**: Code that hasn't been reviewed, refined, and validated by the contributor
- **Scope creep**: Features or changes that go beyond the project's core purpose or current roadmap
- **Low-effort submissions**: Changes resulting from inadequate attention to requirements or codebase structure
- **"Shotgun" approaches**: Submitting multiple poorly-defined changes hoping some will be accepted
- **Generated content without human oversight**: Code or documentation created by AI without proper review and validation

## Contribution Guidelines

### AI-Assisted Development Standards

When using AI tools to assist development:

1. **Prompt with precision**: Craft specific, detailed prompts that include context about the project
2. **Iterate prompts**: Refine your prompts based on initial outputs to get better results
3. **Critical evaluation**: Assess all generated code for quality, adherence to project standards, and potential issues
4. **Document your process**: Include your prompt strategy in PRs to help others learn effective techniques
5. **Take responsibility**: You are accountable for all code you submit, whether AI-generated or not

### Appropriate Contribution Types

Contributions should focus on:

1. **Planned features**: Items explicitly listed in project documentation
2. **Known issues**: Bugs or limitations identified in issues or roadmap
3. **Performance improvements**: Optimizations that maintain compatibility and functionality
4. **Documentation enhancements**: Clarifications or expansions that improve understanding
5. **Compatibility fixes**: Solutions for browser-specific or device-specific issues

## How to Contribute

### Reporting Bugs

1. Search GitHub Issues to ensure the bug hasn't already been reported
2. Create a new issue with:
   - A clear, descriptive title
   - Detailed reproduction steps
   - Expected vs. actual behavior
   - Screenshots or recordings where applicable
   - Environment information (browser, OS, device)
   - Any relevant console errors or logs

### Suggesting Enhancements

1. Review [BLUEPRINT.md](BLUEPRINT.md) and [ROADMAP.md](ROADMAP.md) to ensure alignment
2. Open an issue with:
   - A clear title and problem statement
   - Description of current limitations or pain points
   - Detailed explanation of proposed solution
   - Mockups or diagrams if applicable
   - Consideration of potential implementation challenges
   - Explanation of how the enhancement supports core project goals

### Pull Request Process

1. **Select a well-defined task**:
   - Choose from open issues, BLUEPRINT.md, or ROADMAP.md
   - Confirm your intent to work on it by commenting on the issue

2. **Fork and branch appropriately**:
   - Fork the repository
   - Create a descriptive branch name (e.g., `feature/frequency-management`, `fix/memory-leak`)

3. **Develop with attention to detail**:
   - Follow the existing architecture and patterns
   - Maintain code modularity and separation of concerns
   - Document complex logic with clear comments
   - Ensure proper resource management (especially for audio resources)

4. **Comprehensive testing**:
   - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Verify on both desktop and mobile devices
   - Check for memory leaks during extended usage
   - Validate UI in both light and dark themes
   - Ensure accessibility compliance for UI changes

5. **Create a complete pull request**:
   - Reference any related issues
   - Provide a detailed description of changes
   - Include your prompt engineering methodology if AI-assisted
   - Add screenshots or recordings for visual changes
   - Document testing procedures and environments
   - List any new dependencies and justify their inclusion
   - Update relevant documentation

6. **Be responsive during review**:
   - Address feedback promptly
   - Be open to constructive criticism
   - Explain your reasoning for implementation choices
   - Make requested changes or explain why alternatives might be better

## Development Process Details

### Understanding the Architecture

Before contributing, thoroughly familiarize yourself with:

- The modular component structure in `/js` directories
- Event-based communication patterns used throughout
- Resource management practices in the audio system
- UI rendering and state management approaches

### Code Quality Requirements

All contributions must meet these standards:

1. **Memory Efficiency**:
   - Properly dispose of Audio nodes when no longer needed
   - Avoid unnecessary object creation in performance-critical paths
   - Use appropriate data structures for the task

2. **Error Handling**:
   - Gracefully handle browser API inconsistencies
   - Provide user feedback for recoverable errors
   - Prevent cascading failures from individual component issues

3. **Browser Compatibility**:
   - Support all major browsers (Chrome, Firefox, Safari, Edge)
   - Include fallbacks for browser-specific limitations
   - Test on both desktop and mobile environments

4. **Performance**:
   - Optimize audio processing for battery efficiency
   - Minimize DOM operations, especially in frequently-executed code
   - Use appropriate buffer sizes and processing strategies based on device capabilities

5. **Accessibility**:
   - Maintain keyboard navigability
   - Include appropriate ARIA attributes
   - Ensure sufficient color contrast in both themes
   - Provide text alternatives for visual elements

### Documentation Requirements

Changes should be accompanied by appropriate documentation updates:

1. **Code Comments**:
   - Document complex algorithms or unusual patterns
   - Explain non-obvious optimizations
   - Note browser-specific workarounds

2. **README Updates**:
   - Add new features to the feature list if applicable
   - Update installation or usage instructions if changed

3. **CHANGELOG Entries**:
   - Document new features, fixes, or significant changes

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions and Support

If you have questions about contributing, please open a discussion issue on GitHub before starting work on a pull request.
