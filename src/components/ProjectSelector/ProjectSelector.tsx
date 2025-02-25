import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
  Divider
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  Upload as ImportIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';

const ProjectSelector = () => {
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

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Input states
  const [newProjectName, setNewProjectName] = useState('');
  
  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  // Dialog handlers
  const openCreateDialog = () => {
    setNewProjectName('');
    setCreateDialogOpen(true);
    handleCloseMenu();
  };

  const openRenameDialog = () => {
    if (currentProject) {
      setNewProjectName(currentProject.name);
      setRenameDialogOpen(true);
      handleCloseMenu();
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const openImportDialog = () => {
    setImportDialogOpen(true);
    handleCloseMenu();
  };

  // Project operations
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName);
      setCreateDialogOpen(false);
    }
  };

  const handleRenameProject = () => {
    if (newProjectName.trim() && currentProject) {
      updateProjectName(currentProject.id, newProjectName);
      setRenameDialogOpen(false);
    }
  };

  const handleDeleteProject = () => {
    if (currentProject) {
      deleteProject(currentProject.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleExportProject = () => {
    exportProject();
    handleCloseMenu();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          try {
            const projectData = JSON.parse(content);
            importProject(projectData);
            setImportDialogOpen(false);
          } catch (error) {
            alert('Failed to import project: ' + (error instanceof Error ? error.message : 'Unknown error'));
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSwitchProject = (id: string) => {
    selectProject(id);
    handleCloseMenu();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Button
        endIcon={<ArrowIcon />}
        onClick={handleOpenMenu}
        variant="outlined"
        size="small"
        sx={{ mr: 1, textTransform: 'none' }}
      >
        {currentProject?.name || 'Select Project'}
      </Button>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        {/* Project list */}
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

        {/* Project operations */}
        <MenuItem onClick={openCreateDialog}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Project</ListItemText>
        </MenuItem>

        <MenuItem onClick={openRenameDialog} disabled={!currentProject}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Project</ListItemText>
        </MenuItem>

        <MenuItem onClick={openDeleteDialog} disabled={projects.length <= 1 || !currentProject}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Project</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleExportProject} disabled={!currentProject}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Project</ListItemText>
        </MenuItem>

        <MenuItem onClick={openImportDialog}>
          <ListItemIcon>
            <ImportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import Project</ListItemText>
        </MenuItem>
      </Menu>

      {/* Quick action buttons */}
      <Box>
        <Tooltip title="New Project">
          <IconButton onClick={openCreateDialog} size="small">
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Export Project">
          <IconButton onClick={handleExportProject} size="small" disabled={!currentProject}>
            <ExportIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Import Project">
          <IconButton onClick={openImportDialog} size="small">
            <ImportIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
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
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
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
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
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
            onChange={handleFileSelected}
            style={{ display: 'block', marginTop: '8px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleImportClick}
            variant="contained"
          >
            Browse Files
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileSelected}
      />
    </Box>
  );
};

export default ProjectSelector; 