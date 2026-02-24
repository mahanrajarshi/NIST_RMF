import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

export const getQuestions = () => api.get('/assessment/questions');
export const getIndustries = () => api.get('/assessment/industries');
export const submitAssessment = (data) => api.post('/assessment/submit', data);
export const getAssessment = (id) => api.get(`/assessment/${id}`);
export const getRecommendations = (industry) => api.get(`/recommendations/${industry}`);
export const getMaturityLevels = () => api.get('/maturity-levels');

export default api;
