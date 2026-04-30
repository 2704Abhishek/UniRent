import { api } from "./services/api";

test("api helper attaches the auth header", async () => {
  localStorage.setItem("token", "sample-token");
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  );

  await api.post("/auth/login", { email: "test@example.com" });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:5000/auth/login",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: "Bearer sample-token"
      })
    })
  );
});
