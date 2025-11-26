import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { CloudUpload, Image, Delete } from '@mui/icons-material';
import axios from 'axios';

const MediaManagement = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageTitle, setImageTitle] = useState('');

  const adminToken = localStorage.getItem('adminToken');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('headerImage', selectedFile);
      formData.append('title', imageTitle || 'Header Image');

      const response = await axios.post('/api/media/upload-header', formData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Header image uploaded successfully!');
        setSelectedFile(null);
        setPreviewUrl(null);
        setImageTitle('');
        setOpenDialog(false);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageTitle('');
    setError(null);
    setSuccess(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Media Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload and manage header images for mobile app
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Image sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Header Image Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a new header image for the mobile app home screen
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="header-image-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="header-image-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              size="large"
              sx={{ mb: 2 }}
            >
              Select Header Image
            </Button>
          </label>
        </Box>

        {previewUrl && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview:
            </Typography>
            <Box sx={{ 
              width: '100%', 
              maxWidth: 400, 
              height: 200, 
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}>
              <img 
                src={previewUrl} 
                alt="Preview"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            </Box>
          </Box>
        )}

        {selectedFile && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          </Box>
        )}

        {selectedFile && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(true)}
              disabled={uploading}
            >
              Upload Image
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClear}
              disabled={uploading}
              startIcon={<Delete />}
            >
              Clear
            </Button>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading image...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Upload Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Upload Header Image</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Image Title (Optional)"
            fullWidth
            variant="outlined"
            value={imageTitle}
            onChange={(e) => setImageTitle(e.target.value)}
            placeholder="e.g., Diwali Special, New Year, etc."
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Are you sure you want to upload this image as the new header?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            color="primary" 
            variant="contained"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaManagement;
