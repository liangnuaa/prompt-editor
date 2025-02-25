import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { usePrompt } from '../../context/PromptContext';

const FileContentPanel = () => {
  const { 
    selectedNodeId, 
    getNodeById, 
    updateFileContent, 
    getFileContent 
  } = usePrompt();
  
  const [content, setContent] = useState('');
  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const isFile = selectedNode?.type === 'file';

  // Update content when selected file changes
  useEffect(() => {
    if (selectedNodeId && isFile) {
      setContent(getFileContent(selectedNodeId));
    } else {
      setContent('');
    }
  }, [selectedNodeId, getFileContent, isFile]);

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (selectedNodeId && isFile) {
      updateFileContent(selectedNodeId, newContent);
    }
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          {selectedNode ? selectedNode.name : 'No file selected'}
        </Typography>
      </Box>

      {/* Content area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {selectedNodeId && isFile ? (
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={content}
            onChange={handleContentChange}
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
                fontFamily: 'monospace',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
              },
              '& .MuiInputBase-input': {
                flexGrow: 1,
                overflow: 'auto',
                lineHeight: 1.6,
              },
              '& fieldset': { 
                border: 'none' 
              }
            }}
          />
        ) : (
          <Box sx={{ p: 3, height: '100%' }}>
            {!selectedNodeId ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                Select a file to view and edit its content
              </Typography>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                Folders cannot be edited directly. Please select a file.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileContentPanel; 