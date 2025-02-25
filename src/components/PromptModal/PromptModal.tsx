import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Box
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  prompt: string;
}

const PromptModal = ({ open, onClose, prompt }: PromptModalProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Function to copy prompt to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopySuccess(true);
      
      // Hide the success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Generated Prompt</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Here's your generated prompt combining your instructions, project structure, and file contents.
            </Typography>
          </Box>
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={prompt}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '50vh',
                overflow: 'auto'
              }
            }}
            minRows={10}
            maxRows={20}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="textSecondary">
            {prompt.length} characters
          </Typography>
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Close
            </Button>
            <Button 
              variant="contained" 
              startIcon={copySuccess ? <CheckIcon /> : <CopyIcon />}
              onClick={copyToClipboard}
              color={copySuccess ? "success" : "primary"}
            >
              {copySuccess ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Success notification */}
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Prompt copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PromptModal; 