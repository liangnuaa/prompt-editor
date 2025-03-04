import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';

const ProjectHeader = () => {
  const {
    projects,
    currentProject,
    createProject,
    updateProjectName,
    deleteProject,
    selectProject,
    exportProject,
    importProject
  } = usePrompt();

  // State for project menu
  const [projectMenuAnchor, setProjectMenuAnchor] = useState<null | HTMLElement>(null);
  
  // State for project options menu
  const [optionsMenuAnchor, setOptionsMenuAnchor] = useState<null | HTMLElement>(null);
  
  // State for project dialogs
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // State for project name inputs
  const [newProjectName, setNewProjectName] = useState('');
  const [projectNameToRename, setProjectNameToRename] = useState(currentProject?.name || '');
  
  // State for file import
  const [importFile, setImportFile] = useState<File | null>(null);

  // Handle opening project menu
  const handleProjectMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProjectMenuAnchor(event.currentTarget);
  };

  // Handle opening options menu
  const handleOptionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOptionsMenuAnchor(event.currentTarget);
  };

  // Handle creating a new project
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName);
      setNewProjectName('');
      setNewProjectDialogOpen(false);
    }
  };

  // Handle renaming a project
  const handleRenameProject = () => {
    if (projectNameToRename.trim() && currentProject) {
      updateProjectName(currentProject.id, projectNameToRename);
      setRenameDialogOpen(false);
    }
  };

  // Handle deleting a project
  const handleDeleteProject = () => {
    if (currentProject) {
      deleteProject(currentProject.id);
      setDeleteDialogOpen(false);
    }
  };

  // Handle switching to a project
  const handleSwitchProject = (projectId: string) => {
    selectProject(projectId);
    setProjectMenuAnchor(null);
  };

  // Handle exporting the current project
  const handleExportProject = () => {
    exportProject();
    setOptionsMenuAnchor(null);
  };

  // Handle file selection for import
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0]);
    }
  };

  // Handle importing a project
  const handleImportProject = () => {
    if (importFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          try {
            const projectData = JSON.parse(content);
            importProject(projectData);
            setImportDialogOpen(false);
            setImportFile(null);
          } catch (error) {
            alert('Failed to import project: ' + (error instanceof Error ? error.message : 'Unknown error'));
          }
        }
      };
      reader.readAsText(importFile);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Prompt Editor
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Current Project Button */}
          <Button
            color="inherit"
            onClick={handleProjectMenuOpen}
            sx={{ mr: 1 }}
          >
            {currentProject?.name || 'Select Project'}
          </Button>

          {/* Project Management Menu */}
          <Menu
            anchorEl={projectMenuAnchor}
            open={Boolean(projectMenuAnchor)}
            onClose={() => setProjectMenuAnchor(null)}
          >
            {projects.map((project) => (
              <MenuItem
                key={project.id}
                selected={currentProject ? project.id === currentProject.id : false}
                onClick={() => handleSwitchProject(project.id)}
              >
                {project.name}
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={() => {
              setNewProjectDialogOpen(true);
              setProjectMenuAnchor(null);
            }}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              New Project
            </MenuItem>
          </Menu>

          {/* Project Options Button */}
          <Tooltip title="Project Options">
            <IconButton
              color="inherit"
              onClick={handleOptionsMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          {/* Project Options Menu */}
          <Menu
            anchorEl={optionsMenuAnchor}
            open={Boolean(optionsMenuAnchor)}
            onClose={() => setOptionsMenuAnchor(null)}
          >
            <MenuItem onClick={() => {
              if (currentProject) {
                setProjectNameToRename(currentProject.name);
                setRenameDialogOpen(true);
                setOptionsMenuAnchor(null);
              }
            }}
            disabled={!currentProject}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Rename Project
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setDeleteDialogOpen(true);
                setOptionsMenuAnchor(null);
              }}
              disabled={projects.length <= 1 || !currentProject}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Project
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={handleExportProject}
              disabled={!currentProject}
            >
              <ExportIcon fontSize="small" sx={{ mr: 1 }} />
              Export Project
            </MenuItem>
            
            <MenuItem onClick={() => {
              setImportDialogOpen(true);
              setOptionsMenuAnchor(null);
            }}>
              <ImportIcon fontSize="small" sx={{ mr: 1 }} />
              Import Project
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onClose={() => setNewProjectDialogOpen(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={projectNameToRename}
            onChange={(e) => setProjectNameToRename(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameProject} variant="contained">Rename</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the project "{currentProject?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Import Project Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Project</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Select a project file (.json) to import:
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImportProject} 
            variant="contained"
            disabled={!importFile}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default ProjectHeader; 