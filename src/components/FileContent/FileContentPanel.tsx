import { useState, useEffect, useMemo } from 'react';
import { 
  TextField, 
  Typography, 
  Paper,
  Box
} from '@mui/material';
import { usePrompt } from '../../context/PromptContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Helper to determine language based on file extension
const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Map extensions to language identifiers
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'php': 'php',
    'sh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'graphql': 'graphql',
    'swift': 'swift',
    'kt': 'kotlin',
    'rs': 'rust',
  };
  
  return languageMap[extension] || '';
};

const FileContentPanel = () => {
  // Use our context
  const { selectedFile, fileContents, updateFileContent } = usePrompt();
  
  // State for current content being edited
  const [currentContent, setCurrentContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  // Detect language for syntax highlighting
  const language = useMemo(() => {
    if (!selectedFile) return '';
    return getLanguageFromFileName(selectedFile);
  }, [selectedFile]);

  // Update content when file selection changes
  useEffect(() => {
    if (selectedFile) {
      // If we have content for this file, use it; otherwise use empty string
      const content = fileContents[selectedFile] || '';
      setCurrentContent(content);
      setIsEditing(true);
    } else {
      setCurrentContent('');
    }
  }, [selectedFile, fileContents]);

  // Save content when it changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    setCurrentContent(content);
    
    if (selectedFile) {
      updateFileContent(selectedFile, content);
    }
  };

  // Toggle between edit mode and preview mode with syntax highlighting
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div>
      {selectedFile ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Editing: {selectedFile}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
              onClick={toggleEditMode}
            >
              {isEditing ? 'Show with highlighting' : 'Edit'}
            </Typography>
          </Box>
          
          {isEditing ? (
            <TextField
              multiline
              fullWidth
              variant="outlined"
              value={currentContent}
              onChange={handleContentChange}
              placeholder="Enter file content here..."
              minRows={20}
              maxRows={30}
              sx={{ 
                fontFamily: 'monospace',
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                },
              }}
            />
          ) : (
            <Box 
              sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.23)', 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '70vh'
              }}
            >
              <SyntaxHighlighter
                language={language || 'text'}
                style={materialDark}
                customStyle={{ margin: 0, minHeight: '300px' }}
              >
                {currentContent || ''}
              </SyntaxHighlighter>
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 3, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Select a file from the Project Structure panel to view and edit its content.
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default FileContentPanel; 