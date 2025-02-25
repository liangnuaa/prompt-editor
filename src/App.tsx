import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { useState, useMemo } from 'react';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import './App.css';

// Import our components
import ProjectStructurePanel from './components/ProjectStructure/ProjectStructurePanel';
import FileContentPanel from './components/FileContent/FileContentPanel';
import InstructionsPanel from './components/Instructions/InstructionsPanel';
import ProjectHeader from './components/ProjectHeader/ProjectHeader';
import KeyboardShortcuts from './components/KeyboardShortcuts/KeyboardShortcuts';

// Import our context provider
import { PromptProvider } from './context/PromptContext';

function App() {
  // State for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  // Create a theme based on dark mode preference
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#90caf9' : '#1976d2',
          },
          secondary: {
            main: darkMode ? '#f48fb1' : '#dc004e',
          },
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [darkMode]
  );

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PromptProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <ProjectHeader />
          
          <Container maxWidth={false} disableGutters sx={{ flexGrow: 1, padding: 2, paddingTop: 0, position: 'relative' }}>
            {/* Dark Mode Toggle */}
            <Box sx={{ position: 'absolute', top: 8, right: 16, zIndex: 10 }}>
              <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                <IconButton onClick={toggleDarkMode} color="inherit">
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* Project Structure Panel - Left Side */}
              <Grid item xs={12} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: { xs: 'auto', md: '100%' }, 
                    overflow: 'auto', 
                    p: 2,
                    mb: { xs: 2, md: 0 } 
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Project Structure
                  </Typography>
                  <ProjectStructurePanel />
                </Paper>
              </Grid>
              
              {/* File Content Panel - Middle */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: { xs: 'auto', md: '100%' }, 
                    overflow: 'auto', 
                    p: 2,
                    mb: { xs: 2, md: 0 } 
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    File Content
                  </Typography>
                  <FileContentPanel />
                </Paper>
              </Grid>
              
              {/* Instructions Panel - Right Side */}
              <Grid item xs={12} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: { xs: 'auto', md: '100%' }, 
                    overflow: 'auto', 
                    p: 2 
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <InstructionsPanel />
                </Paper>
              </Grid>
            </Grid>
          </Container>
          
          {/* Keyboard Shortcuts Component */}
          <KeyboardShortcuts />
        </Box>
      </PromptProvider>
    </ThemeProvider>
  );
}

export default App;
