import request from "supertest";
import app from "../server";
import { query, queryOne } from "../db/connection";
import { hashPassword } from "../utils/password";
import { hashRefreshToken } from "../utils/jwt";

// Mock database or use test database
// For integration tests, you'd use a real test database
// For now, we'll test the endpoints with mocked database calls

describe("POST /api/auth/register", () => {
  const validUser = {
    email: "test@example.com",
    password: "Test1234!",
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await query("DELETE FROM users WHERE email = $1", [validUser.email]);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await query("DELETE FROM users WHERE email = $1", [validUser.email]);
  });

  it("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect(201);

    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully"
    );
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("email", validUser.email);
    expect(response.body.user).not.toHaveProperty("password_hash");
    expect(response.body.user).not.toHaveProperty("refresh_token");
  });

  it("should return 409 for duplicate email", async () => {
    // First registration
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    // Second registration with same email
    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect(409);

    expect(response.body.error).toHaveProperty("code", "duplicate_email");
    expect(response.body.error).toHaveProperty("message");
  });

  it("should return 400 for invalid email format", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "invalid-email",
        password: "Test1234!",
      })
      .expect(400);

    expect(response.body.error).toHaveProperty("code", "validation_error");
    expect(response.body.error).toHaveProperty("details");
  });

  it("should return 400 for weak password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "weak",
      })
      .expect(400);

    expect(response.body.error).toHaveProperty("code", "validation_error");
    expect(response.body.error).toHaveProperty("details");
  });

  it("should return 400 for missing required fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.error).toHaveProperty("code", "validation_error");
  });
});

describe("POST /api/auth/login", () => {
  const validUser = {
    email: "login@example.com",
    password: "Test1234!",
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await query("DELETE FROM users WHERE email = $1", [validUser.email]);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await query("DELETE FROM users WHERE email = $1", [validUser.email]);
  });

  it("should login successfully and return access token", async () => {
    // First register the user
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    // Then login
    const response = await request(app)
      .post("/api/auth/login")
      .send(validUser)
      .expect(200);

    expect(response.body).toHaveProperty("message", "Login successful");
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("email", validUser.email);
    expect(response.body.user).not.toHaveProperty("password_hash");
    expect(response.body.user).not.toHaveProperty("refresh_token");
  });

  it("should set HttpOnly refresh token cookie", async () => {
    // First register the user
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    // Then login
    const response = await request(app)
      .post("/api/auth/login")
      .send(validUser)
      .expect(200);

    const cookies = response.headers["set-cookie"] as unknown as
      | string[]
      | undefined;
    expect(cookies).toBeDefined();

    const refreshTokenCookie = cookies?.find((cookie: string) =>
      cookie.startsWith("refreshToken=")
    );
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain("HttpOnly");
  });

  it("should return 401 for invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "Test1234!",
      })
      .expect(401);

    expect(response.body.error).toHaveProperty("code", "invalid_credentials");
  });

  it("should return 401 for invalid password", async () => {
    // First register the user
    await request(app).post("/api/auth/register").send(validUser).expect(201);

    // Then try to login with wrong password
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
        password: "WrongPassword123!",
      })
      .expect(401);

    expect(response.body.error).toHaveProperty("code", "invalid_credentials");
  });

  it("should return 400 for invalid email format", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: "Test1234!",
      })
      .expect(400);

    expect(response.body.error).toHaveProperty("code", "validation_error");
  });

  it("should return 400 for missing password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.error).toHaveProperty("code", "validation_error");
  });
});
