const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined" && localHosts.has(window.location.hostname)) {
    return "http://localhost:5000";
  }

  return "/api";
};

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl()
);

export const getSocketBaseUrl = () => {
  const configuredSocketUrl = process.env.REACT_APP_SOCKET_BASE_URL;

  if (configuredSocketUrl) {
    return trimTrailingSlash(configuredSocketUrl);
  }

  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return API_BASE_URL;
  }

  return undefined;
};

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        "Content-Type": "application/json",
        ...(options.headers || {})
      };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error("Unable to reach the UniRent server. Please check the API URL and HTTPS proxy.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  delete: (path) =>
    request(path, {
      method: "DELETE"
    })
};
