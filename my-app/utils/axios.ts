import axiosLib from 'axios';

const axios = axiosLib.create({
  baseURL: 'https://sbahiyahia.com/api', 
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

export default axios;
