import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadCSV = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload', formData);
};