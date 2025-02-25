# Prompt Editor

A web-based editor for creating, managing, and generating AI prompts from project structures and file contents.

## Features

- **Project Management**: Create, rename, switch between, and delete multiple projects
- **Project Structure Panel**: Add, rename, and remove files in your project structure with drag-and-drop reordering
- **File Content Panel**: Edit the content of selected files with syntax highlighting
- **Instructions Panel**: Add instructions for AI models with file name autocomplete
- **Prompt Generation**: Generate and copy a complete prompt including instructions, project structure, and file contents
- **Import/Export**: Save and load projects to/from JSON files
- **Local Storage**: Project data is automatically saved in your browser's local storage
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Optimized for both desktop and mobile use
- **Keyboard Shortcuts**: Improve productivity with keyboard commands for common actions

## Upcoming Features

- Project templates
- Enhanced UI/UX refinements
- Collaborative editing
- Advanced prompt configuration options

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm

### Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Usage

1. Use the project menu in the header to create and manage projects
2. Add files to your project using the "Add File" button in the Project Structure panel
3. Drag and drop files to reorder them in the project structure
4. Rename or delete files using the file options menu (three dots icon)
5. Select a file to view and edit its content in the File Content panel with syntax highlighting
6. Use keyboard shortcuts (press '?' to view available shortcuts) for faster workflow
7. Toggle between light and dark modes using the theme toggle button
8. Add your AI instructions in the Instructions panel with file name autocomplete
9. Click the "Generate & Copy Prompt" button to create and copy your complete prompt
10. Export your project to share it or import projects created by others

## Keyboard Shortcuts

- **?**: Show keyboard shortcuts dialog
- **Ctrl+N**: Create a new file
- **Ctrl+G**: Generate prompt
- **Ctrl+S**: Save current file
- **Ctrl+/**: Comment/uncomment line

## Development Roadmap

- **Phase 1**: ✅ Basic structure with panels and file management
- **Phase 2**: ✅ Prompt generation functionality and local storage
- **Phase 3**: ✅ Advanced features (project management, autocomplete, file renaming, syntax highlighting)
- **Phase 4**: ✅ UI/UX enhancements (dark mode, responsive design, keyboard shortcuts, drag-and-drop)
- **Phase 5**: Testing and refinement

## Built With

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Material-UI](https://mui.com/) - Component library
- [Vite](https://vitejs.dev/) - Build tool
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Code syntax highlighting
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) - Drag and drop functionality
