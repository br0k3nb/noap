import axios from 'axios';

// const config =  { host: 'localhost', port: 3001 };
// const { host, port } = config;

// const api = axios.create({baseURL: ` http://${host}:${port}/`});

const api = axios.create({baseURL: `https://noap-typescript-api.vercel.app/`});

export default api;