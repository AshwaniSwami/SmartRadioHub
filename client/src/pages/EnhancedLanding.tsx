import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import {
  Radio,
  Description,
  Group,
  Mic,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useTheme } from '@/components/ThemeProvider';

export default function EnhancedLanding() {
  const { darkMode, toggleDarkMode } = useTheme();

  const features = [
    {
      icon: <Description sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Script Management',
      description: 'Create, edit, and manage all your radio scripts in one centralized location with rich text editing capabilities.',
    },
    {
      icon: <Group sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: 'Collaborative Workflow',
      description: 'Multi-stage approval process with role-based permissions for scriptwriters, producers, and managers.',
    },
    {
      icon: <Mic sx={{ fontSize: 48, color: 'info.main' }} />,
      title: 'Recording & Archive',
      description: 'Track recordings, broadcast dates, and archive completed episodes with audio file management.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Radio sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              SMART Radio
            </Typography>
          </Box>
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(45deg, #1976d2, #4caf50)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Content Management Platform
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Streamline your radio content workflow with our comprehensive platform.
            From script creation to broadcast management.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => (window.location.href = '/api/login')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Sign In to Get Started
          </Button>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Workflow Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            Workflow Process
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              'Draft',
              'Submitted',
              'Under Review',
              'Approved',
              'Recorded',
              'Archived',
            ].map((status, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    py: 1.5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 3,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  {status}
                </Box>
                {index < 5 && (
                  <Box
                    sx={{
                      width: 24,
                      height: 2,
                      bgcolor: 'primary.light',
                      mx: 'auto',
                      mt: 1,
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Card
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
            p: 6,
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to Transform Your Radio Content?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join SMART Radio's content management platform today
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => (window.location.href = '/api/login')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Access Dashboard
          </Button>
        </Card>
      </Container>
    </Box>
  );
}