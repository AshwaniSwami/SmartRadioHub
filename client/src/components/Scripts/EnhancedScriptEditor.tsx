import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Save,
  Send,
  CloudUpload,
  Delete,
  ArrowBack,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedScriptEditorProps {
  scriptId?: number;
  onBack: () => void;
}

export default function EnhancedScriptEditor({ scriptId, onBack }: EnhancedScriptEditorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    episodeNumber: '',
    projectId: '',
    content: '',
    topicIds: [] as number[],
    reviewComments: '',
    broadcastDate: '',
    audioLink: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Fetch script data if editing
  const { data: script, isLoading: scriptLoading } = useQuery({
    queryKey: ['/api/scripts', scriptId],
    enabled: !!scriptId,
  });

  // Fetch projects and topics
  const { data: projects = [] } = useQuery({ queryKey: ['/api/projects'] });
  const { data: topics = [] } = useQuery({ queryKey: ['/api/topics'] });

  useEffect(() => {
    if (script) {
      setFormData({
        title: script.title || '',
        episodeNumber: script.episodeNumber || '',
        projectId: script.projectId?.toString() || '',
        content: script.content || '',
        topicIds: script.topics?.map((t: any) => t.id) || [],
        reviewComments: script.reviewComments || '',
        broadcastDate: script.broadcastDate || '',
        audioLink: script.audioLink || '',
      });
    }
  }, [script]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = scriptId ? `/api/scripts/${scriptId}` : '/api/scripts';
      const method = scriptId ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'topicIds') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== '') {
          formDataToSend.append(key, data[key]);
        }
      });
      
      if (selectedFile) {
        formDataToSend.append('audioFile', selectedFile);
      }
      
      return await apiRequest(method, url, formDataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scripts'] });
      setSnackbar({
        open: true,
        message: scriptId ? 'Script updated successfully!' : 'Script created successfully!',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Failed to save script. Please try again.',
        severity: 'error',
      });
    },
  });

  const handleSave = (action: 'draft' | 'submit') => {
    const dataToSave = {
      ...formData,
      projectId: parseInt(formData.projectId),
      status: action === 'draft' ? 'draft' : 'submitted',
    };
    saveMutation.mutate(dataToSave);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
      } else {
        setSnackbar({
          open: true,
          message: 'Please select an audio file',
          severity: 'error',
        });
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  if (scriptLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {scriptId ? 'Edit Script' : 'Create New Script'}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              variant="outlined"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Episode Number"
              value={formData.episodeNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: e.target.value }))}
              variant="outlined"
              placeholder="e.g. #127"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Project *</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                label="Project *"
                required
              >
                {projects.map((project: any) => (
                  <MenuItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Topics</InputLabel>
              <Select
                multiple
                value={formData.topicIds}
                onChange={(e) => setFormData(prev => ({ ...prev, topicIds: e.target.value as number[] }))}
                label="Topics"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const topic = topics.find((t: any) => t.id === value);
                      return <Chip key={value} label={topic?.name} size="small" />;
                    })}
                  </Box>
                )}
              >
                {topics.map((topic: any) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Rich Text Editor */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Script Content
            </Typography>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                modules={quillModules}
                style={{ minHeight: '300px' }}
              />
            </Box>
          </Grid>

          {/* Audio Upload Section */}
          {(user?.role === 'radio_producer' || user?.role === 'program_manager' || user?.role === 'administrator') && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Audio & Recording
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Google Drive URL"
                  value={formData.audioLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, audioLink: e.target.value }))}
                  variant="outlined"
                  placeholder="https://drive.google.com/..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Broadcast Date"
                  type="date"
                  value={formData.broadcastDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, broadcastDate: e.target.value }))}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Upload Audio File
                    </Typography>
                    
                    {!selectedFile ? (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 2 }}
                      >
                        Choose Audio File
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={handleFileSelect}
                        />
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="body2">
                          {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </Typography>
                        <IconButton onClick={removeFile} size="small">
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                    
                    {uploadProgress > 0 && (
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Review Comments - Only for managers */}
          {(user?.role === 'program_manager' || user?.role === 'administrator') && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Review Comments"
                multiline
                rows={3}
                value={formData.reviewComments}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewComments: e.target.value }))}
                variant="outlined"
                placeholder="Add comments for revision..."
              />
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={() => handleSave('draft')}
                disabled={saveMutation.isPending}
              >
                Save as Draft
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => handleSave('submit')}
                disabled={saveMutation.isPending || !formData.title || !formData.projectId}
              >
                {saveMutation.isPending ? <CircularProgress size={20} /> : 'Submit for Review'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}