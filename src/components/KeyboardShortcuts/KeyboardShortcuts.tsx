import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { usePrompt } from '../../context/PromptContext';

interface ShortcutItem {
  key: string;
  description: string;
  action: () => void;
}

const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);
  const { 
    addFile, 
    generatePrompt, 
    selectedFile, 
    updateFileContent, 
    fileContents 
  } = usePrompt();

  // Define keyboard shortcuts
  const shortcuts: ShortcutItem[] = [
    {
      key: 'Ctrl+N',
      description: 'Create new file',
      action: () => {
        const fileName = prompt('Enter file name:');
        if (fileName) addFile(fileName);
      }
    },
    {
      key: 'Ctrl+G',
      description: 'Generate prompt',
      action: () => generatePrompt()
    },
    {
      key: 'Ctrl+S',
      description: 'Save current file',
      action: () => {
        if (selectedFile) {
          // Flash success message or handle this however you want
          console.log(`${selectedFile} saved`);
        }
      }
    },
    {
      key: 'Ctrl+/',
      description: 'Comment/uncomment line',
      action: () => {
        if (selectedFile) {
          const content = fileContents[selectedFile] || '';
          const lines = content.split('\n');
          const cursorPosition = document.activeElement && 'selectionStart' in document.activeElement 
            ? (document.activeElement as HTMLTextAreaElement).selectionStart
            : 0;
          
          // Find current line
          let charCount = 0;
          let lineIndex = 0;
          
          for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 for newline
            if (charCount > cursorPosition) {
              lineIndex = i;
              break;
            }
          }
          
          // Toggle comment on current line
          const line = lines[lineIndex];
          if (line.trimStart().startsWith('//')) {
            lines[lineIndex] = line.replace(/^\s*\/\/\s?/, '');
          } else {
            lines[lineIndex] = line.replace(/^(\s*)/, '$1// ');
          }
          
          updateFileContent(selectedFile, lines.join('\n'));
        }
      }
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setOpen(true)
    }
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? key to show shortcuts dialog
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      
      // Ctrl+N to create new file
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        shortcuts[0].action();
        return;
      }
      
      // Ctrl+G to generate prompt
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        shortcuts[1].action();
        return;
      }
      
      // Ctrl+S to save current file (mostly for user peace of mind)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        shortcuts[2].action();
        return;
      }
      
      // Ctrl+/ to comment/uncomment line
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        shortcuts[3].action();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFile, fileContents]);

  return (
    <>
      <Tooltip title="Keyboard Shortcuts">
        <Fab 
          size="small" 
          color="primary"
          aria-label="keyboard shortcuts"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <KeyboardIcon />
        </Fab>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Keyboard Shortcuts
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {shortcuts.map((shortcut) => (
              <Grid item xs={12} key={shortcut.key}>
                <Grid container>
                  <Grid item xs={4}>
                    <Typography variant="body1" fontWeight="bold">
                      {shortcut.key}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">
                      {shortcut.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KeyboardShortcuts; 