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
  Tooltip,
  Collapse,
  Typography
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragHandleIcon,
  CreateNewFolder as NewFolderIcon,
  NoteAdd as NewFileIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ProjectStructurePanel = () => {
  // Use our context
  const { 
    fileStructure,
    selectedNodeId, 
    addFile, 
    addFolder,
    removeNode, 
    setSelectedNodeId, 
    renameNode,
    moveNode,
    getChildNodes,
    getNodeById
  } = usePrompt();
  
  // State for file/folder dialogs
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  
  // State for rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [nodeToRename, setNodeToRename] = useState<string | null>(null);
  const [newNodeName, setNewNodeName] = useState('');
  
  // State for context menu
  const [contextMenuAnchor, setContextMenuAnchor] = useState<null | HTMLElement>(null);
  const [contextMenuNodeId, setContextMenuNodeId] = useState<string | null>(null);
  
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  
  // Toggle folder expanded state
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Check if a folder is expanded
  const isFolderExpanded = (folderId: string) => {
    return !!expandedFolders[folderId];
  };

  // Handle adding a new file or folder
  const handleAddItem = () => {
    console.log('handleAddItem called', { newItemName, newItemType, newItemParentId });
    
    if (newItemName.trim() === '') {
      console.log('Item name is empty, returning');
      return;
    }
    
    if (newItemType === 'file') {
      console.log('Adding file:', newItemName);
      addFile(newItemName, newItemParentId);
    } else {
      console.log('Adding folder:', newItemName);
      addFolder(newItemName, newItemParentId);
      
      // Auto-expand the new folder
      const nodeIds = Object.keys(fileStructure);
      for (const id of nodeIds) {
        const node = fileStructure[id];
        if (node.type === 'folder' && node.name === newItemName && node.parentId === newItemParentId) {
          console.log('Auto-expanding new folder:', id);
          setExpandedFolders(prev => ({
            ...prev,
            [id]: true
          }));
          break;
        }
      }
    }
    
    setNewItemName('');
    setNewItemDialogOpen(false);
  };

  // Handle removing a node
  const handleDeleteNode = (nodeId: string) => {
    setNodeToDelete(nodeId);
    setDeleteDialogOpen(true);
    setContextMenuAnchor(null);
  };

  // Confirm node deletion
  const confirmDeleteNode = () => {
    if (nodeToDelete) {
      removeNode(nodeToDelete);
      setDeleteDialogOpen(false);
      setNodeToDelete(null);
    }
  };
  
  // Handle initiating node rename
  const handleRenameNode = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (node) {
      setNodeToRename(nodeId);
      setNewNodeName(node.name);
      setRenameDialogOpen(true);
      setContextMenuAnchor(null);
    }
  };
  
  // Confirm node rename
  const confirmRenameNode = () => {
    if (nodeToRename && newNodeName.trim() !== '') {
      renameNode(nodeToRename, newNodeName);
      setRenameDialogOpen(false);
      setNodeToRename(null);
      setNewNodeName('');
    } else {
      setRenameDialogOpen(false);
    }
  };
  
  // Open context menu
  const handleContextMenu = (event: React.MouseEvent<HTMLElement>, nodeId: string) => {
    event.stopPropagation();
    event.preventDefault();
    setContextMenuAnchor(event.currentTarget);
    setContextMenuNodeId(nodeId);
  };
  
  // Add new item to a folder
  const handleAddToFolder = (nodeId: string, type: 'file' | 'folder') => {
    setNewItemType(type);
    setNewItemParentId(nodeId);
    setNewItemName('');
    setNewItemDialogOpen(true);
    setContextMenuAnchor(null);
  };
  
  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside the list or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Moving to a different parent
    const destParentId = destination.droppableId === 'root' ? null : destination.droppableId;
    moveNode(draggableId, destParentId);
    
    // Ensure destination folder is expanded
    if (destParentId) {
      setExpandedFolders(prev => ({
        ...prev,
        [destParentId]: true
      }));
    }
  };
  
  // Recursive component for rendering file tree
  const FileTreeItem = ({ nodeId, level = 0, index }: { nodeId: string, level?: number, index: number }) => {
    const node = getNodeById(nodeId);
    if (!node) return null;
    
    const isFolder = node.type === 'folder';
    const expanded = isFolder && isFolderExpanded(nodeId);
    const childNodes = isFolder ? getChildNodes(nodeId) : [];
    
    return (
      <Draggable draggableId={nodeId} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <ListItem
              disablePadding
              sx={{
                pl: level * 2,
                backgroundColor: snapshot.isDragging 
                  ? 'rgba(0, 0, 0, 0.05)' 
                  : 'transparent'
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <div {...provided.dragHandleProps}>
                    <IconButton size="small">
                      <DragHandleIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <Tooltip title="Options">
                    <IconButton 
                      edge="end" 
                      onClick={(e) => handleContextMenu(e, nodeId)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemButton
                selected={selectedNodeId === nodeId}
                onClick={() => {
                  if (isFolder) {
                    toggleFolder(nodeId);
                  } else {
                    setSelectedNodeId(nodeId);
                  }
                }}
                sx={{ pl: 1 }}
              >
                {isFolder && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(nodeId);
                    }}
                    sx={{ mr: 1, p: 0 }}
                  >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
                <ListItemIcon sx={{ minWidth: isFolder ? 36 : 56 }}>
                  {isFolder ? (
                    expanded ? <FolderOpenIcon /> : <FolderIcon />
                  ) : (
                    <FileIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={node.name}
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
            
            {isFolder && (
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Droppable droppableId={nodeId}>
                  {(provided) => (
                    <List
                      dense
                      disablePadding
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {childNodes.map((childNode, index) => (
                        <FileTreeItem 
                          key={childNode.id}
                          nodeId={childNode.id}
                          level={level + 1}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                      
                      {childNodes.length === 0 && (
                        <ListItem sx={{ pl: (level + 1) * 2 + 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            (Empty folder)
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Droppable>
              </Collapse>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  // Root level file/folder nodes
  const rootNodes = getChildNodes(null);

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="root">
          {(provided) => (
            <List
              dense
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {rootNodes.map((node, index) => (
                <FileTreeItem 
                  key={node.id} 
                  nodeId={node.id} 
                  index={index}
                />
              ))}
              {provided.placeholder}
              
              {rootNodes.length === 0 && (
                <ListItem>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, width: '100%', textAlign: 'center' }}>
                    No files or folders. Click "Add File" or "Add Folder" to get started.
                  </Typography>
                </ListItem>
              )}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Node context menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={Boolean(contextMenuAnchor)}
        onClose={() => setContextMenuAnchor(null)}
      >
        {contextMenuNodeId && getNodeById(contextMenuNodeId)?.type === 'folder' && (
          <>
            <MenuItem onClick={() => {
              if (contextMenuNodeId) {
                handleAddToFolder(contextMenuNodeId, 'file');
              }
            }}>
              <ListItemIcon>
                <NewFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add File</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenuNodeId) {
                handleAddToFolder(contextMenuNodeId, 'folder');
              }
            }}>
              <ListItemIcon>
                <NewFolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Folder</ListItemText>
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => contextMenuNodeId && handleRenameNode(contextMenuNodeId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => contextMenuNodeId && handleDeleteNode(contextMenuNodeId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          startIcon={<NewFileIcon />}
          onClick={() => {
            setNewItemType('file');
            setNewItemParentId(null);
            setNewItemName('');
            setNewItemDialogOpen(true);
          }}
          fullWidth
        >
          Add File
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<NewFolderIcon />}
          onClick={() => {
            setNewItemType('folder');
            setNewItemParentId(null);
            setNewItemName('');
            setNewItemDialogOpen(true);
          }}
        >
          Add Folder
        </Button>
      </Box>

      {/* Add new item dialog */}
      <Dialog open={newItemDialogOpen} onClose={() => setNewItemDialogOpen(false)}>
        <DialogTitle>
          {newItemType === 'file' ? 'Add New File' : 'Add New Folder'}
          {newItemParentId && getNodeById(newItemParentId) && (
            <Typography variant="subtitle2" color="text.secondary">
              In folder: {getNodeById(newItemParentId)?.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for the new {newItemType}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={newItemType === 'file' ? 'File Name' : 'Folder Name'}
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {nodeToDelete && getNodeById(nodeToDelete)?.type === 'folder' ? (
              <>Are you sure you want to delete the folder "{getNodeById(nodeToDelete)?.name}" and all its contents? This action cannot be undone.</>
            ) : (
              <>Are you sure you want to delete "{getNodeById(nodeToDelete)?.name}"? This action cannot be undone.</>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDeleteNode} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename {nodeToRename && getNodeById(nodeToRename)?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for "{getNodeById(nodeToRename)?.name}".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            variant="outlined"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRenameNode}>Rename</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectStructurePanel; 