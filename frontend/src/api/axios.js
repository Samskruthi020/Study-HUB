// src/api/axios.js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:5001", // updated to match backend port
});
