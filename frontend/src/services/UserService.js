import axios from 'axios';
import Config from '../config';

const USERS_ENDPOINT = `${Config.API_PROTOCOL}://${Config.API_DOMAIN}:${Config.API_PORT}/users`;
const AUTH_ENDPOINT = `${Config.API_PROTOCOL}://${Config.API_DOMAIN}:${Config.API_PORT}/auth`;

class UserService {
  static register(userDetails) {
    return axios.post(USERS_ENDPOINT, userDetails);
  }

  static login(credentials) {
    return axios.post(AUTH_ENDPOINT, credentials);
  }

  static async isLoggedIn() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken === null || accessToken === undefined)
      return undefined;
    return await this.getId();
  }

  static getUserAuthToken() {
    return JSON.parse(localStorage.getItem('access_token'));
  }

  static getAuthHeader() {
    return { headers: { Authorization: `JWT ${this.getUserAuthToken()}` } };
  }

  static logout() {
    localStorage.removeItem('access_token');
  }

  static getId() {
    return axios.get(`${Config.API_PROTOCOL}://${Config.API_DOMAIN}:${Config.API_PORT}/myid`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'JWT ' + localStorage.getItem('access_token'),
        }
      });
  }

}

export default UserService;
