# Prompt Editor

A modern, user-friendly editor for creating and managing prompts for AI models. This tool aims to simplify the process of creating, testing, and refining prompts for AI systems.

## Features

- **Project Management**:
  - Create and manage multiple prompt projects
  - Export and import projects for sharing or backup
  - Organize files with nested folder structure

- **File Management**:
  - Create, edit, rename, and delete files
  - Drag and drop functionality for reordering files and moving between folders
  - Nested folder support for better organization of complex projects
  - File name autocomplete in the Instructions panel 

- **Content Editing**:
  - Syntax highlighting for multiple languages
  - Line numbers and code formatting
  - Auto-indentation and bracket matching

- **Instructions Panel**:
  - Dedicated space for writing instructions for the AI model
  - Smart file path detection and autocomplete
  - Support for custom formatting directives

- **Prompt Generation**:
  - Generate formatted prompts combining files and instructions
  - Preview generated prompts before submission
  - One-click copy to clipboard

## Upcoming Features

- **Collaborative Editing**:
  - Real-time collaboration with team members
  - Comments and annotations on prompts

- **Advanced Prompt Configuration**:
  - Parameter settings (temperature, top-p, etc.)
  - Custom stop sequences

## Getting Started

### Installation

```bash
git clone https://github.com/yourusername/prompt-editor.git
cd prompt-editor
npm install
npm run dev
```

### Usage

1. **Create a New Project**: Use the project menu to create a new project
2. **Add Files and Folders**: Create folders to organize your content and add files to your project
3. **Edit File Content**: Click on a file to edit its content with syntax highlighting
4. **Write Instructions**: Use the instructions panel to provide context and directions for the AI
5. **Generate Prompt**: Click the "Generate Prompt" button to combine your files and instructions
6. **Copy and Use**: Copy the generated prompt to use with your preferred AI model

### Folder Structure

The nested folder structure allows you to organize your files in a hierarchical manner:

- Create folders and subfolders to group related files
- Drag and drop files between folders for easy organization
- Expand and collapse folders to focus on specific parts of your project

## Development Roadmap

- ✅ **Phase 1**: Basic Functionality
  - Project creation and management
  - File management
  - Content editing
  - Instructions panel

- ✅ **Phase 2**: Enhanced Editing Experience
  - Syntax highlighting
  - Improved UI/UX
  - Keyboard shortcuts
  - File exploration
  
- ✅ **Phase 3**: Project Management
  - Project export/import
  - File names autocomplete
  - Enhanced file management
  - Smart content editing
  
- ✅ **Phase 4**: UI/UX Enhancements
  - Responsive design
  - Dark mode
  - Keyboard shortcuts
  - Drag and drop reordering
  
- ✅ **Phase 5**: Nested Folders
  - Hierarchical file organization
  - Folder creation and management
  - Drag and drop between folders
  - Enhanced navigation

- 🔄 **Phase 6**: Testing and Refinement
  - Comprehensive testing
  - Bug fixing
  - Performance optimization
  - User feedback implementation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
