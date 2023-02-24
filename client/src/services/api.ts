import axios from 'axios';

const config =  {
    host: 'localhost',
    port: 3001,
    baseUrl: '/',
};

const {host, port} = config;

const api = axios.create({baseURL: `http://${host}:${port}/`});

export default api;