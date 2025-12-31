import { appState } from "./state.js";

export function getToken() {
  return localStorage.getItem("token");
}

export function setUser(user) {
  appState.user = user;
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}