import axios from 'axios';
// Same-origin proxy adds a verified identity-provider token on the server.
export const apiClient = axios.create({baseURL:'/api/erp', withCredentials:true, timeout:15000});
export const fetchClient = apiClient;
export default apiClient;
