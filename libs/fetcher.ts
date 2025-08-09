// libs/fetcher.ts
import axios from "axios";

// Globally tell axios to send cookies on same-origin requests
axios.defaults.withCredentials = true;

const fetcher = (url: string) =>
  axios
    .get(url)
    .then((res) => res.data);

export default fetcher;
