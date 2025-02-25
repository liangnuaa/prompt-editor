import { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemButton,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragHandleIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ProjectStructurePanel = () => {
  // Use our context
  const { files, selectedFile, addFile, removeFile, setSelectedFile, renameFile, reorderFiles } = usePrompt();
  
  // State for new file dialog
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  
  // State for rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<string | null>(null);
  const [newFileToRename, setNewFileToRename] = useState('');
  
  // State for file menu
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(null);
  const [fileMenuTarget, setFileMenuTarget] = useState<string | null>(null);
  
  // Handle adding a new file
  const handleAddFile = () => {
    if (newFileName.trim() !== '') {
      addFile(newFileName);
      setNewFileName('');
      setNewFileDialogOpen(false);
    }
  };

  // Handle removing a file
  const handleDeleteFile = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteDialogOpen(true);
    setFileMenuAnchor(null);
  };

  // Confirm file deletion
  const confirmDeleteFile = () => {
    if (fileToDelete) {
      removeFile(fileToDelete);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };
  
  // Handle initiating file rename
  const handleRenameFile = (fileName: string) => {
    setFileToRename(fileName);
    setNewFileToRename(fileName);
    setRenameDialogOpen(true);
    setFileMenuAnchor(null);
  };
  
  // Confirm file rename
  const confirmRenameFile = () => {
    if (fileToRename && newFileToRename.trim() !== '' && fileToRename !== newFileToRename) {
      renameFile(fileToRename, newFileToRename);
      setRenameDialogOpen(false);
      setFileToRename(null);
      setNewFileToRename('');
    } else {
      setRenameDialogOpen(false);
    }
  };
  
  // Open file context menu
  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>, fileName: string) => {
    event.stopPropagation();
    setFileMenuAnchor(event.currentTarget);
    setFileMenuTarget(fileName);
  };
  
  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update file order in context
    reorderFiles(items);
  };

  return (
    <div>
      {/* File list with drag and drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fileList">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {files.map((file, index) => (
                <Draggable key={file} draggableId={file} index={index}>
                  {(provided, snapshot) => (
                    <ListItem 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <div {...provided.dragHandleProps}>
                            <IconButton size="small">
                              <DragHandleIcon fontSize="small" />
                            </IconButton>
                          </div>
                          <Tooltip title="File Options">
                            <IconButton 
                              edge="end" 
                              onClick={(e) => handleFileMenuOpen(e, file)}
                              size="small"
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{
                        backgroundColor: snapshot.isDragging 
                          ? 'rgba(0, 0, 0, 0.05)' 
                          : 'transparent',
                        '& .MuiListItemSecondaryAction-root': {
                          opacity: snapshot.isDragging ? 0.7 : 1
                        }
                      }}
                    >
                      <ListItemButton
                        selected={selectedFile === file}
                        onClick={() => setSelectedFile(file)}
                      >
                        <ListItemIcon>
                          <FileIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary={file} 
                          primaryTypographyProps={{
                            style: {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* File options menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={() => setFileMenuAnchor(null)}
      >
        <MenuItem onClick={() => fileMenuTarget && handleRenameFile(fileMenuTarget)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => fileMenuTarget && handleDeleteFile(fileMenuTarget)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Button to add new file */}
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setNewFileDialogOpen(true)}
          fullWidth
        >
          Add File
        </Button>
      </Box>

      {/* New file dialog */}
      <Dialog open={newFileDialogOpen} onClose={() => setNewFileDialogOpen(false)}>
        <DialogTitle>Add New File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the file you want to add to your project.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFile}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteFile} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename file dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for "{fileToRename}".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New File Name"
            fullWidth
            variant="outlined"
            value={newFileToRename}
            onChange={(e) => setNewFileToRename(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRenameFile}>Rename</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectStructurePanel; 