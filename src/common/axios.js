import axios from 'axios'
import Cookies from 'js-cookie'
const instance = axios.create({
  baseURL: 'http://127.0.0.1:7002/',
  withCredentials: true
})
instance.interceptors.request.use(function (config) {
  const csrfToken = Cookies.get('csrfToken')
  config.headers['x-csrf-token'] = csrfToken
  return config
})
export default instance
