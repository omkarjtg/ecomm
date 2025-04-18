import React, { useState } from 'react';
import API from '../axios';
import { toast } from 'react-toastify';
import { Button, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const GenerateDescriptionButton = ({ productId, onDescriptionGenerated }) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth(); // Retrieve token from AuthContext

  const handleGenerateDescription = async () => {
    setLoading(true);

    try {
      const response = await API.post(`/api/product/${productId}/generate-description`);

      // Extract the description from the response if it's the raw API response
      let updatedProduct = response.data;
      if (updatedProduct.candidates && updatedProduct.candidates[0]?.content?.parts?.[0]?.text) {
        updatedProduct = {
          ...updatedProduct,
          description: updatedProduct.candidates[0].content.parts[0].text
        };
      }

      toast.success('Description generated successfully!');

      // Call the callback to refresh the product data
      if (onDescriptionGenerated) { 
        onDescriptionGenerated(updatedProduct);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data ||
        error.message ||
        'Failed to generate description. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <Button
        variant="contained"
        color="secondary"
        onClick={handleGenerateDescription}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Generating...' : 'Generate Description'}
      </Button>
    </Box>
  );
};

export default GenerateDescriptionButton;