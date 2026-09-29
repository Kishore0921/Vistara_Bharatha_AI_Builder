import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getSectors = async () => {
  const response = await axios.get(`${API_BASE_URL}/sectors/`);
  return response.data;
};

export const getSector = async (sectorId) => {
  const response = await axios.get(`${API_BASE_URL}/sectors/${sectorId}`);
  return response.data;
};

export const getSectorAnalysis = async (sectorId) => {
  const response = await axios.get(`${API_BASE_URL}/sectors/${sectorId}/analysis`);
  return response.data;
};

export const getSectorGraph = async (sectorId) => {
  const response = await axios.get(`${API_BASE_URL}/sectors/${sectorId}/graph`);
  return response.data;
};

export const simulateIntervention = async (request) => {
  const response = await axios.post(`${API_BASE_URL}/simulate`, request);
  return response.data;
};

export const getAIExplanation = async (results) => {
  const response = await axios.post(`${API_BASE_URL}/ai/explain`, { results });
  return response.data;
};

export const generateReport = async (request) => {
  const response = await axios.post(`${API_BASE_URL}/reports/generate`, request, {
    responseType: 'blob'
  });
  return response.data;
};
