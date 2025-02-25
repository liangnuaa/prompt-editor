import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TextField, 
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';
import PromptModal from '../PromptModal/PromptModal';

const InstructionsPanel = () => {
  // Use our context
  const { 
    currentProject, 
    updateInstructions, 
    generatePrompt, 
    fileStructure,
    getChildNodes,
    getNodeById
  } = usePrompt();
  
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  // State for clear confirmation dialog
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // State for autocomplete
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsAnchorEl, setSuggestionsAnchorEl] = useState<HTMLElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const textFieldRef = useRef<HTMLInputElement>(null);
  
  // Get all file nodes for autocomplete
  const getAllFileNames = useMemo(() => {
    const fileNames: string[] = [];
    
    // Recursive function to get all file nodes
    const collectFileNames = (nodeId: string, path: string = '') => {
      const node = getNodeById(nodeId);
      if (!node) return;
      
      const nodePath = path ? `${path}/${node.name}` : node.name;
      
      if (node.type === 'file') {
        fileNames.push(nodePath);
      } else {
        // It's a folder, process its children
        const children = getChildNodes(nodeId);
        children.forEach(child => collectFileNames(child.id, nodePath));
      }
    };
    
    // Get root nodes and process them
    const rootNodes = getChildNodes(null);
    rootNodes.forEach(node => collectFileNames(node.id));
    
    return fileNames;
  }, [fileStructure, getChildNodes, getNodeById]);
  
  // Function to handle file name autocompletion
  const handleAutoComplete = (selectedFile: string) => {
    // Find the current word being typed
    const beforeCursor = currentProject?.instructions?.substring(0, cursorPosition) || '';
    const afterCursor = currentProject?.instructions?.substring(cursorPosition) || '';
    
    // Find the start of the current word
    let wordStart = beforeCursor.lastIndexOf(' ');
    if (wordStart === -1) wordStart = 0;
    else wordStart += 1;
    
    // Replace the current word with the selected file
    const newInstructions = 
      beforeCursor.substring(0, wordStart) + 
      selectedFile + 
      afterCursor;
    
    updateInstructions(newInstructions);
    
    // Close the suggestions
    setSuggestionsOpen(false);
  };

  // Handle instructions changes
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInstructions(e.target.value);
    
    // Get the cursor position
    const cursorPos = e.target.selectionStart ?? 0;
    setCursorPosition(cursorPos);
    
    // Find the current word being typed
    const beforeCursor = e.target.value.substring(0, cursorPos);
    const currentWordMatch = beforeCursor.match(/\S+$/);
    
    if (currentWordMatch && currentWordMatch[0].length >= 2) {
      const currentWord = currentWordMatch[0].toLowerCase();
      
      // Filter files that match the current word
      const matchedFiles = getAllFileNames.filter(fileName => 
        fileName.toLowerCase().includes(currentWord)
      );
      
      if (matchedFiles.length > 0) {
        setSuggestions(matchedFiles);
        setSuggestionsOpen(true);
        setSuggestionsAnchorEl(e.target);
      } else {
        setSuggestionsOpen(false);
      }
    } else {
      setSuggestionsOpen(false);
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestionsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Position the suggestions popup
  const popoverPosition = useMemo(() => {
    if (!textFieldRef.current || !suggestionsAnchorEl) return {};
    
    const textFieldRect = textFieldRef.current.getBoundingClientRect();
    const lineHeight = 20; // Approximate line height
    
    // Calculate cursor position relative to the text field
    const instructions = currentProject?.instructions || '';
    const lines = instructions.substring(0, cursorPosition).split('\n').length - 1;
    const top = textFieldRect.top + 12 + (lines * lineHeight); // Adjust 12px for padding
    
    return {
      position: 'absolute',
      zIndex: 1300,
      left: textFieldRect.left + 12, // Adjust 12px for padding
      top: top,
      width: textFieldRect.width - 24 // Adjust 24px for padding (12px each side)
    };
  }, [suggestionsAnchorEl, cursorPosition, currentProject?.instructions]);

  // Generate and show prompt
  const handleGeneratePrompt = () => {
    const prompt = generatePrompt();
    setGeneratedPrompt(prompt);
    setModalOpen(true);
  };

  // Handle clear project
  const handleClearProject = () => {
    updateInstructions('');
    setClearDialogOpen(false);
  };

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        AI Instructions
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Enter your instructions for the AI model here. These will be prepended to your prompt. 
        Type a file name (min. 2 characters) to see autocomplete suggestions.
      </Typography>
      
      <div style={{ position: 'relative' }}>
        <TextField
          multiline
          fullWidth
          variant="outlined"
          value={currentProject?.instructions || ''}
          onChange={handleInstructionsChange}
          placeholder="Enter your instructions for the AI..."
          minRows={15}
          maxRows={25}
          inputRef={textFieldRef}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            setCursorPosition(target.selectionStart ?? 0);
          }}
        />
        
        {suggestionsOpen && suggestions.length > 0 && (
          <Paper
            sx={{
              ...popoverPosition,
              maxHeight: '200px',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <List dense>
              {suggestions.map((file) => (
                <ListItem 
                  key={file} 
                  onClick={() => handleAutoComplete(file)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemText primary={file} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </div>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<CopyIcon />}
          onClick={handleGeneratePrompt}
          fullWidth
        >
          Generate & Copy Prompt
        </Button>
        
        <Button 
          variant="outlined" 
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setClearDialogOpen(true)}
        >
          Clear
        </Button>
      </Box>

      {/* Prompt Modal */}
      <PromptModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prompt={generatedPrompt}
      />

      {/* Clear Project Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear Instructions</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all instructions? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearProject} color="error" variant="contained">Clear Instructions</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InstructionsPanel; 