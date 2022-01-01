import axios from 'axios';

export default {
  async smart(path, params) {
    return axios.post(path, params)
      .then((response) => response.data)
      .catch((e) => e);
  },
};
