import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { saveAs } from 'file-saver';

// Define project type
interface Project {
  id: string;
  name: string;
  files: string[];
  fileContents: Record<string, string>;
  instructions: string;
}

// Define the shape of our context
interface PromptContextType {
  // Project management
  projects: Project[];
  currentProjectId: string | null;
  createProject: (name: string) => void;
  renameProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  exportProject: (id: string) => void;
  importProject: (projectData: string) => void;
  
  // Current project data
  files: string[];
  fileContents: Record<string, string>;
  instructions: string;
  selectedFile: string | null;
  projectName: string;
  
  // File operations
  addFile: (fileName: string) => void;
  removeFile: (fileName: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
  renameFile: (oldFileName: string, newFileName: string) => void;
  reorderFiles: (newOrder: string[]) => void;
  
  // Instructions
  updateInstructions: (instructions: string) => void;
  
  // UI state
  setSelectedFile: (fileName: string) => void;
  
  // Prompt generation
  generatePrompt: () => string;
  
  // Project operations
  clearProject: () => void;
}

// Create the storage keys
const STORAGE_KEYS = {
  PROJECTS: 'prompt-editor-projects',
  CURRENT_PROJECT: 'prompt-editor-current-project'
};

// Helper to safely parse JSON from localStorage
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error parsing stored value for key ${key}:`, error);
    return defaultValue;
  }
};

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a default project
const createDefaultProject = (): Project => {
  return {
    id: generateId(),
    name: 'New Project',
    files: [],
    fileContents: {},
    instructions: ''
  };
};

// Create the context
const PromptContext = createContext<PromptContextType | undefined>(undefined);

// Create a provider component
export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize projects from localStorage if available
  const [projects, setProjects] = useState<Project[]>(
    getStoredValue(STORAGE_KEYS.PROJECTS, [createDefaultProject()])
  );
  
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    getStoredValue(STORAGE_KEYS.CURRENT_PROJECT, projects[0]?.id || null)
  );
  
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Get current project
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || createDefaultProject();

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(currentProjectId));
  }, [currentProjectId]);

  // Project management functions
  const createProject = (name: string) => {
    const newProject: Project = {
      id: generateId(),
      name: name || 'New Project',
      files: [],
      fileContents: {},
      instructions: ''
    };
    
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    setSelectedFile(null);
  };

  const renameProject = (id: string, newName: string) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { ...project, name: newName || project.name } 
        : project
    ));
  };

  const deleteProject = (id: string) => {
    // Don't delete if it's the only project
    if (projects.length <= 1) {
      return;
    }
    
    const newProjects = projects.filter(project => project.id !== id);
    setProjects(newProjects);
    
    // If deleting the current project, switch to another one
    if (currentProjectId === id) {
      setCurrentProjectId(newProjects[0]?.id || null);
      setSelectedFile(null);
    }
  };

  const switchProject = (id: string) => {
    if (projects.some(project => project.id === id)) {
      setCurrentProjectId(id);
      setSelectedFile(null);
    }
  };

  // File operations for the current project
  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  const addFile = (fileName: string) => {
    if (fileName.trim() !== '' && !currentProject.files.includes(fileName)) {
      const updatedProject = {
        ...currentProject,
        files: [...currentProject.files, fileName],
        fileContents: {
          ...currentProject.fileContents,
          [fileName]: currentProject.fileContents[fileName] || ''
        }
      };
      updateProject(updatedProject);
    }
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = currentProject.files.filter(file => file !== fileName);
    
    // Create a new fileContents object without the removed file
    const updatedFileContents = { ...currentProject.fileContents };
    delete updatedFileContents[fileName];
    
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      fileContents: updatedFileContents
    };
    
    updateProject(updatedProject);
    
    // If the removed file was selected, clear the selection
    if (selectedFile === fileName) {
      setSelectedFile(null);
    }
  };

  const updateFileContent = (fileName: string, content: string) => {
    const updatedProject = {
      ...currentProject,
      fileContents: {
        ...currentProject.fileContents,
        [fileName]: content
      }
    };
    updateProject(updatedProject);
  };

  const renameFile = (oldFileName: string, newFileName: string) => {
    if (newFileName.trim() === '' || 
        oldFileName === newFileName || 
        currentProject.files.includes(newFileName)) {
      return;
    }
    
    // Create a new file array with the renamed file
    const fileIndex = currentProject.files.indexOf(oldFileName);
    if (fileIndex === -1) return;
    
    const updatedFiles = [...currentProject.files];
    updatedFiles[fileIndex] = newFileName;
    
    // Copy the content from old file to new file
    const updatedFileContents = { ...currentProject.fileContents };
    updatedFileContents[newFileName] = updatedFileContents[oldFileName];
    delete updatedFileContents[oldFileName];
    
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      fileContents: updatedFileContents
    };
    
    updateProject(updatedProject);
    
    // Update selected file if it was the renamed one
    if (selectedFile === oldFileName) {
      setSelectedFile(newFileName);
    }
  };

  const updateInstructions = (newInstructions: string) => {
    const updatedProject = {
      ...currentProject,
      instructions: newInstructions
    };
    updateProject(updatedProject);
  };

  // Clear the current project
  const clearProject = () => {
    const updatedProject = {
      ...currentProject,
      files: [],
      fileContents: {},
      instructions: ''
    };
    updateProject(updatedProject);
    setSelectedFile(null);
  };

  // Export and import functions
  const exportProject = (id: string) => {
    const project = projects.find(p => p.id === id) || currentProject;
    const projectData = JSON.stringify(project, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    saveAs(blob, `${project.name.replace(/\s+/g, '-').toLowerCase()}-prompt-project.json`);
  };

  const importProject = (projectData: string) => {
    try {
      const parsedData = JSON.parse(projectData);
      
      // Validate the imported data has the required fields
      if (!parsedData.name || !Array.isArray(parsedData.files)) {
        throw new Error('Invalid project data format');
      }
      
      // Create a new project with the imported data, but with a new ID
      const newProject: Project = {
        id: generateId(),
        name: parsedData.name,
        files: parsedData.files || [],
        fileContents: parsedData.fileContents || {},
        instructions: parsedData.instructions || ''
      };
      
      setProjects([...projects, newProject]);
      setCurrentProjectId(newProject.id);
      setSelectedFile(null);
      
      return true;
    } catch (error) {
      console.error('Failed to import project:', error);
      return false;
    }
  };

  // Generate the prompt for the current project
  const generatePrompt = (): string => {
    let prompt = '';
    
    // Add instructions
    if (currentProject.instructions.trim()) {
      prompt += `${currentProject.instructions.trim()}\n\n`;
    }
    
    // Add project structure
    if (currentProject.files.length > 0) {
      prompt += `Project Structure:\n`;
      currentProject.files.forEach(file => {
        prompt += `- ${file}\n`;
      });
      prompt += '\n';
    }
    
    // Add file contents
    currentProject.files.forEach(file => {
      const content = currentProject.fileContents[file] || '';
      if (content.trim()) {
        prompt += `File: ${file}\n`;
        prompt += '```\n';
        prompt += `${content}\n`;
        prompt += '```\n\n';
      }
    });
    
    return prompt;
  };

  // Reorder files in a project
  const reorderFiles = (newOrder: string[]) => {
    if (!currentProjectId) return;
    
    setProjects(prev => {
      return prev.map(project => {
        if (project.id === currentProjectId) {
          // Verify that the new order contains all the same files (just reordered)
          if (newOrder.length !== project.files.length || 
              !newOrder.every(file => project.files.includes(file))) {
            console.error('Invalid file reordering - file lists do not match');
            return project;
          }
          
          return {
            ...project,
            files: newOrder
          };
        }
        return project;
      });
    });
  };

  return (
    <PromptContext.Provider value={{
      // Project management
      projects,
      currentProjectId,
      createProject,
      renameProject,
      deleteProject,
      switchProject,
      exportProject,
      importProject,
      
      // Current project data
      files: currentProject.files,
      fileContents: currentProject.fileContents,
      instructions: currentProject.instructions,
      selectedFile,
      projectName: currentProject.name,
      
      // File operations
      addFile,
      removeFile,
      updateFileContent,
      renameFile,
      reorderFiles,
      
      // Instructions
      updateInstructions,
      
      // UI state
      setSelectedFile,
      
      // Prompt generation
      generatePrompt,
      
      // Project operations
      clearProject
    }}>
      {children}
    </PromptContext.Provider>
  );
};

// Custom hook for using the context
export const usePrompt = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
}; 