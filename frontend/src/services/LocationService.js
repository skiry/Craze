import axios from 'axios';
import Config from '../config';

const LOCATION_ENDPOINT = `${Config.API_PROTOCOL}://${Config.API_DOMAIN}:${Config.API_PORT}/locations`;

class LocationService {

  static sendLocation(locationDetails) {
    return axios.post(LOCATION_ENDPOINT,
      locationDetails,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'JWT ' + localStorage.getItem('access_token'),
        }
      });
  }

  static updateLocation(locationDetails) {
    const id = locationDetails['id'];
    return axios.put(LOCATION_ENDPOINT + '/' + id.toString(),
      locationDetails,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'JWT ' + localStorage.getItem('access_token'),
        }
      });
  }

  static deleteLocation(locationDetails) {
    const id = locationDetails['id'];
    return axios.delete(LOCATION_ENDPOINT + '/' + id.toString(), {
        headers: {
          'Authorization': 'JWT ' + localStorage.getItem('access_token'),
        }
      });
  }

  static getLocations() {
    return axios.get(LOCATION_ENDPOINT, {
      headers: {
        'Authorization': 'JWT ' + localStorage.getItem('access_token')
      },
    });
  }

  static getLocationsByTags(tag) {
    return axios.get(LOCATION_ENDPOINT,
      {
        params: {'tag': tag},
        headers: {
          'Authorization': 'JWT ' + localStorage.getItem('access_token')
        }
      });
  }
}

export default LocationService;
