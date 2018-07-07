import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

axios.defaults.adapter = httpAdapter;
axios.interceptors.response.use(response => response, (error) => {
  const { message, config: { url } } = error;
  const statusMessage = error.response ? ` (${error.response.statusText})` : '';
  const newMessage = `Error ${message}${statusMessage} for ${url}`;
  return Promise.reject(new Error(newMessage));
});
export default axios;
