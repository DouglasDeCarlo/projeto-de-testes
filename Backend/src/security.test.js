import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify: jest.fn(), sign: jest.fn() },
}));
jest.unstable_mockModule("./models/product.js", () => ({
  Product: {
    find: jest.fn().mockResolvedValue([]),
  },
}));

const { app } = await import("./app.js");
const jwt = (await import("jsonwebtoken")).default;
const { default: UserController } = await import("./controller/UserController.js");

function criarResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Segurança HTTP", () => {
  it("adiciona headers de proteção do Helmet", async () => {
    const resposta = await request(app).get("/products/");

    expect(resposta.headers["x-content-type-options"]).toBe("nosniff");
    expect(resposta.headers["x-powered-by"]).toBeUndefined();
  });

  it("permite CORS apenas para a origem configurada", async () => {
    const resposta = await request(app)
      .get("/products/")
      .set("Origin", "http://localhost:5173");

    expect(resposta.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });

  it("rejeita origem CORS não autorizada", async () => {
    const resposta = await request(app)
      .get("/products/")
      .set("Origin", "https://site-malicioso.example");

    expect(resposta.status).not.toBe(200);
  });

  it("rejeita JSON maior que o limite configurado", async () => {
    const resposta = await request(app)
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ name: "x".repeat(150000) }));

    expect(resposta.status).toBe(413);
  });
});

describe("Segurança de autenticação", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retorna 401 sem header Authorization", () => {
    const req = { headers: {} };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 401 para token que não usa Bearer", () => {
    const req = { headers: { authorization: "token-sem-prefixo" } };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("aceita Bearer e coloca o usuário autenticado na requisição", () => {
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: "1", role: "user" }));
    const req = { headers: { authorization: "Bearer token-valido" } };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("token-valido", process.env.JWT_SECRET, expect.any(Function));
    expect(req.user).toEqual({ userId: "1", role: "user" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("retorna 403 para token JWT inválido", () => {
    jwt.verify.mockImplementation((token, secret, callback) => callback(new Error("inválido"), undefined));
    const req = { headers: { authorization: "Bearer token-invalido" } };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
