import axios from "axios";
import { EventBus } from "./event-bus.js";

export {
  isLoggedIn,
  isUserActive,
  isUserEnabled,
  login,
  logout,
  getProfile,
  setProfile,
  getToken,
  getUserRole,
  resetPassword,
  hasActiveRole,
  getActiveRole
};

const HOST = process.env.API_HOST || "";

const API_URL = HOST + "/api";
const LOGIN_URL = API_URL + "/login";

const verboseRoles = {
  superadmin: "SuperAdmin"
};

const roleNeedsEnabled = {
  user: true,
  admin: false,
  superadmin: false,
  hr: false,
  hrhead: false
};

function hasActiveRole() {
  return localStorage.getItem("activeRole") != null;
}

function getActiveRole() {
  if (hasActiveRole()) {
    return JSON.parse(localStorage.getItem("activeRole")).code;
  }

  return null;
}

function getToken() {
  return isLoggedIn() ? localStorage.getItem("token") : null;
}

function isLoggedIn() {
  // localStorage item is null when it's equal to 'null' (string null)
  return localStorage.getItem("token") != "null";
}

function isUserActive() {
  // localStorage item is null when it's equal to 'null' (string null)
  return getProfile() ? getProfile().active : false;
}

function isUserEnabled() {
  // localStorage item is null when it's equal to 'null' (string null)
  let user = getProfile();

  if (user && user.roles) {
    let userRoleCode = user.roles[0].code;

    return roleNeedsEnabled[userRoleCode] ? user.enabled : true;
  }

  return false;
}

function getProfile() {
  var user = JSON.parse(localStorage.getItem("user"));

  if (user == null || user == undefined || user == {} || user == []) {
    return null;
  }

  return user;
}

function setProfile(user) {
  localStorage.setItem("user", JSON.stringify(user));
  EventBus.$emit("reload-user");
}

function getUserRole(role) {
  return verboseRoles[role];
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("activeRole");

  axios.defaults.headers.common["Authorization"] = null;
  delete axios.defaults.headers.common["activerole"];
}

async function login(username, password) {
  let loginFormData = new FormData();

  loginFormData.set("username", username);
  loginFormData.set("password", password);

  let response = {
    error: null,
    data: null
  };

  try {
    response.data = await axios.post(LOGIN_URL, loginFormData);
  } catch (e) {
    response.error = e;
    return response;
  }

  let data = response.data.data;

  if (!data.access_token) {
    data.detail = "missing_token";

    return {
      error: data
    };
  }

  localStorage.setItem("token", data.access_token);

  axios.defaults.headers.common["Authorization"] =
    "Bearer " + data.access_token;

  setProfile(data.user);

  return {
    user: data.user
  };
}

function resetPassword(email) {
  return new Promise(function(resolve, reject) {
    axios
      .post(LOGIN_URL + "/resetpassword", {
        email: email
      })
      .then(
        function(response) {
          resolve(response.data);
        },
        function(err) {
          reject(err.response.data);
        }
      );
  });
}
