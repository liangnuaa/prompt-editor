import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
}

export interface Project {
  id: string;
  name: string;
  fileStructure: Record<string, FileNode>; // Map of id -> FileNode
  rootFolderIds: string[]; // IDs of top-level folders
  fileContents: Record<string, string>;
  instructions: string;
}

// Context type definition
interface PromptContextType {
  currentProject: Project | null;
  projects: Project[];
  selectedNodeId: string | null;
  fileStructure: Record<string, FileNode>;
  rootFolderIds: string[];
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  addFile: (name: string, parentId: string | null) => void;
  addFolder: (name: string, parentId: string | null) => void;
  removeNode: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  updateInstructions: (content: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  renameNode: (id: string, newName: string) => void;
  moveNode: (id: string, newParentId: string | null) => void;
  getNodeById: (id: string | null) => FileNode | null;
  getChildNodes: (parentId: string | null) => FileNode[];
  getFileContent: (id: string) => string;
  exportProject: () => void;
  importProject: (projectData: Project) => void;
  generatePrompt: () => string;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompt = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const PromptProvider: React.FC<ProviderProps> = ({ children }) => {
  // State for storing projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const storedProjects = localStorage.getItem('promptEditorProjects');
    if (storedProjects) {
      try {
        return JSON.parse(storedProjects);
      } catch (e) {
        console.error('Failed to parse stored projects', e);
        return [];
      }
    }
    return [];
  });

  // Current selected project
  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    const storedCurrentProject = localStorage.getItem('promptEditorCurrentProject');
    if (storedCurrentProject && projects.length > 0) {
      try {
        const currentId = JSON.parse(storedCurrentProject);
        return projects.find(p => p.id === currentId) || projects[0];
      } catch (e) {
        console.error('Failed to parse current project', e);
        return projects[0];
      }
    }
    return projects.length > 0 ? projects[0] : null;
  });

  // Selected file within the current project
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Update local storage when projects change
  useEffect(() => {
    localStorage.setItem('promptEditorProjects', JSON.stringify(projects));
  }, [projects]);

  // Update local storage when current project changes
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('promptEditorCurrentProject', JSON.stringify(currentProject.id));
    }
  }, [currentProject]);

  // Create a new project
  const createProject = (name: string) => {
    console.log('Creating new project:', name);
    const newProject: Project = {
      id: uuidv4(),
      name,
      fileStructure: {},
      rootFolderIds: [],
      fileContents: {},
      instructions: ''
    };
    
    console.log('New project created:', newProject);
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setSelectedNodeId(null);
  };

  // Delete a project
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    
    // If we deleted the current project, select the first available one
    if (currentProject && currentProject.id === id) {
      const remainingProjects = projects.filter(p => p.id !== id);
      setCurrentProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      setSelectedNodeId(null);
    }
  };

  // Select a project
  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      setSelectedNodeId(null);
    }
  };

  // Update project name
  const updateProjectName = (id: string, name: string) => {
    setProjects(prev => 
      prev.map(p => p.id === id ? { ...p, name } : p)
    );
    
    if (currentProject && currentProject.id === id) {
      setCurrentProject(prev => prev ? { ...prev, name } : null);
    }
  };

  // Get node by ID
  const getNodeById = (id: string | null): FileNode | null => {
    if (!id || !currentProject) return null;
    return currentProject.fileStructure[id] || null;
  };

  // Get children of a node
  const getChildNodes = (parentId: string | null): FileNode[] => {
    if (!currentProject) return [];
    
    const children = Object.values(currentProject.fileStructure).filter(
      node => node.parentId === parentId
    );
    console.log('getChildNodes', { parentId, children, fileStructure: currentProject?.fileStructure });
    return children;
  };

  // Add a new file to the current project
  const addFile = (name: string, parentId: string | null) => {
    console.log('addFile called', { name, parentId, currentProject: !!currentProject });
    
    if (!currentProject) {
      console.error("No current project selected");
      return;
    }

    // Validate parent folder exists if provided
    if (parentId && !currentProject.fileStructure[parentId]) {
      console.error("Parent folder not found", { parentId });
      return;
    }

    // Check for duplicate names in the same directory
    const siblings = getChildNodes(parentId);
    if (siblings.some(node => node.name === name && node.type === 'file')) {
      console.error("A file with this name already exists in this directory");
      return;
    }

    const newId = uuidv4();
    const newFile: FileNode = {
      id: newId,
      name,
      type: 'file',
      parentId
    };

    console.log('Creating new file', newFile);

    // Update project with new file
    const updatedProject = {
      ...currentProject,
      fileStructure: {
        ...currentProject.fileStructure,
        [newId]: newFile
      },
      fileContents: {
        ...currentProject.fileContents,
        [newId]: ''
      }
    };

    console.log('Updating project with new file');
    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
    setSelectedNodeId(newId);
  };

  // Add a new folder to the current project
  const addFolder = (name: string, parentId: string | null) => {
    console.log('addFolder called', { name, parentId, currentProject: !!currentProject });
    
    if (!currentProject) {
      console.error("No current project selected");
      return;
    }
    
    // Validate parent folder exists if provided
    if (parentId && !currentProject.fileStructure[parentId]) {
      console.error("Parent folder not found", { parentId });
      return;
    }

    // Check for duplicate names in the same directory
    const siblings = getChildNodes(parentId);
    if (siblings.some(node => node.name === name && node.type === 'folder')) {
      console.error("A folder with this name already exists in this directory");
      return;
    }

    const newId = uuidv4();
    const newFolder: FileNode = {
      id: newId,
      name,
      type: 'folder',
      parentId
    };

    const newRootFolderIds = [...currentProject.rootFolderIds];
    if (parentId === null) {
      newRootFolderIds.push(newId);
    }

    console.log('Creating new folder', newFolder, 'rootFolderIds:', newRootFolderIds);

    // Update project with new folder
    const updatedProject = {
      ...currentProject,
      fileStructure: {
        ...currentProject.fileStructure,
        [newId]: newFolder
      },
      rootFolderIds: newRootFolderIds
    };

    console.log('Updating project with new folder');
    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Remove a node (file or folder) from the current project
  const removeNode = (id: string) => {
    if (!currentProject || !currentProject.fileStructure[id]) return;

    const nodeToRemove = currentProject.fileStructure[id];
    const isFolder = nodeToRemove.type === 'folder';

    // If it's a folder, we need to remove all its children recursively
    const nodesToRemove = [id];
    
    if (isFolder) {
      // Get all descendant nodes recursively
      const getAllDescendants = (nodeId: string) => {
        const childNodes = getChildNodes(nodeId);
        childNodes.forEach(child => {
          nodesToRemove.push(child.id);
          if (child.type === 'folder') {
            getAllDescendants(child.id);
          }
        });
      };
      
      getAllDescendants(id);
    }

    // Create a new fileStructure without the removed nodes
    const newFileStructure = { ...currentProject.fileStructure };
    const newFileContents = { ...currentProject.fileContents };
    
    nodesToRemove.forEach(nodeId => {
      delete newFileStructure[nodeId];
      delete newFileContents[nodeId];
    });

    // Update rootFolderIds if needed
    const newRootFolderIds = [...currentProject.rootFolderIds];
    if (nodeToRemove.parentId === null) {
      newRootFolderIds.splice(newRootFolderIds.indexOf(id), 1);
    }

    // Update the current project
    const updatedProject = {
      ...currentProject,
      fileStructure: newFileStructure,
      fileContents: newFileContents,
      rootFolderIds: newRootFolderIds
    };

    // Clear selection if the selected node is being removed
    if (selectedNodeId && nodesToRemove.includes(selectedNodeId)) {
      setSelectedNodeId(null);
    }

    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Rename a node (file or folder)
  const renameNode = (id: string, newName: string) => {
    if (!currentProject || !currentProject.fileStructure[id] || newName.trim() === '') return;

    const nodeToRename = currentProject.fileStructure[id];
    
    // Check for duplicate names in the same directory
    const siblings = getChildNodes(nodeToRename.parentId);
    if (siblings.some(node => node.name === newName && node.id !== id && node.type === nodeToRename.type)) {
      console.error(`A ${nodeToRename.type} with this name already exists in this directory`);
      return;
    }

    // Update the node name
    const updatedNode = { ...nodeToRename, name: newName };
    
    const updatedProject = {
      ...currentProject,
      fileStructure: {
        ...currentProject.fileStructure,
        [id]: updatedNode
      }
    };

    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Move a node to a new parent folder
  const moveNode = (id: string, newParentId: string | null) => {
    if (!currentProject || !currentProject.fileStructure[id]) return;

    // Validate that the new parent exists if it's not null (not the root level)
    if (newParentId !== null && (!currentProject.fileStructure[newParentId] || currentProject.fileStructure[newParentId].type !== 'folder')) {
      console.error("Invalid destination folder");
      return;
    }

    // Prevent moving a node to its own descendant
    if (newParentId !== null) {
      let currentParent: string | null = newParentId;
      while (currentParent !== null) {
        if (currentParent === id) {
          console.error("Cannot move a folder into its own descendant");
          return;
        }
        const parentNode: FileNode | null = currentProject.fileStructure[currentParent] || null;
        currentParent = parentNode ? parentNode.parentId : null;
      }
    }

    const nodeToMove = currentProject.fileStructure[id];
    const oldParentId = nodeToMove.parentId;
    
    // Check for name conflicts in destination folder
    const destSiblings = getChildNodes(newParentId);
    if (destSiblings.some(node => node.name === nodeToMove.name && node.type === nodeToMove.type)) {
      console.error(`A ${nodeToMove.type} with the same name already exists in the destination folder`);
      return;
    }

    // Update the node's parent
    const updatedNode = { ...nodeToMove, parentId: newParentId };
    
    // Update rootFolderIds if moving to/from root level
    const newRootFolderIds = [...currentProject.rootFolderIds];
    
    if (oldParentId === null && newParentId !== null) {
      // Moving from root to a folder
      const index = newRootFolderIds.indexOf(id);
      if (index !== -1) {
        newRootFolderIds.splice(index, 1);
      }
    } else if (oldParentId !== null && newParentId === null && nodeToMove.type === 'folder') {
      // Moving from a folder to root
      newRootFolderIds.push(id);
    }

    const updatedProject = {
      ...currentProject,
      fileStructure: {
        ...currentProject.fileStructure,
        [id]: updatedNode
      },
      rootFolderIds: newRootFolderIds
    };

    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Update file content
  const updateFileContent = (id: string, content: string) => {
    if (!currentProject || !currentProject.fileStructure[id]) return;

    const node = currentProject.fileStructure[id];
    if (node.type !== 'file') return;

    const updatedProject = {
      ...currentProject,
      fileContents: {
        ...currentProject.fileContents,
        [id]: content
      }
    };

    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Get file content
  const getFileContent = (id: string): string => {
    if (!currentProject || !currentProject.fileContents[id]) return '';
    return currentProject.fileContents[id];
  };

  // Update instructions
  const updateInstructions = (content: string) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      instructions: content
    };

    setProjects(prev => 
      prev.map(p => p.id === currentProject.id ? updatedProject : p)
    );
    setCurrentProject(updatedProject);
  };

  // Export the current project as a JSON file
  const exportProject = () => {
    if (!currentProject) return;

    const dataStr = JSON.stringify(currentProject, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${currentProject.name.replace(/\s+/g, '_')}_export.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import a project from a JSON file
  const importProject = (projectData: Project) => {
    // Generate a new ID to avoid conflicts
    const newProject = {
      ...projectData,
      id: uuidv4()
    };
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setSelectedNodeId(null);
  };

  // Generate a prompt from the current project
  const generatePrompt = (): string => {
    if (!currentProject) return '';
    
    // Part 1: Format the folder/file structure as a tree (no content)
    const formatStructure = (nodeId: string, level: number = 0): string => {
      const node = currentProject.fileStructure[nodeId];
      if (!node) return '';
      
      const indent = '  '.repeat(level);
      
      if (node.type === 'folder') {
        const children = getChildNodes(nodeId);
        if (children.length === 0) {
          return `${indent}📁 ${node.name} (empty folder)\n`;
        }
        
        return `${indent}📁 ${node.name}/\n${children.map(child => formatStructure(child.id, level + 1)).join('')}`;
      } else {
        // Just show the file name, no content
        return `${indent}📄 ${node.name}\n`;
      }
    };
    
    // Part 2: Collect all file nodes to show their content separately
    const allFileNodes: FileNode[] = [];
    
    const collectFiles = (nodeId: string) => {
      const node = currentProject.fileStructure[nodeId];
      if (!node) return;
      
      if (node.type === 'file') {
        allFileNodes.push(node);
      } else {
        // It's a folder, process its children
        const children = getChildNodes(nodeId);
        children.forEach(child => collectFiles(child.id));
      }
    };
    
    // Get all root nodes and process them
    const rootNodes = getChildNodes(null);
    
    // Create the file structure tree
    const fileTree = rootNodes.map(node => formatStructure(node.id)).join('');
    
    // Collect all files
    rootNodes.forEach(node => collectFiles(node.id));
    
    // Format the file contents section
    const fileContents = allFileNodes.map(node => {
      const content = currentProject.fileContents[node.id] || '';
      return `### 📄 ${node.name}\n${'```'}\n${content}\n${'```'}\n\n`;
    }).join('');
    
    return `# Project: ${currentProject.name}\n\n## File Structure:\n\n${fileTree}\n## File Contents:\n\n${fileContents}## Instructions:\n\n${currentProject.instructions}`;
  };

  // Get current fileStructure and rootFolderIds from the current project
  const fileStructure = currentProject ? currentProject.fileStructure : {};
  const rootFolderIds = currentProject ? currentProject.rootFolderIds : [];

  // Context value
  const value: PromptContextType = {
    currentProject,
    projects,
    selectedNodeId,
    fileStructure,
    rootFolderIds,
    createProject,
    deleteProject,
    selectProject,
    updateProjectName,
    addFile,
    addFolder,
    removeNode,
    updateFileContent,
    updateInstructions,
    setSelectedNodeId,
    renameNode,
    moveNode,
    getNodeById,
    getChildNodes,
    getFileContent,
    exportProject,
    importProject,
    generatePrompt
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
}; 