import { http, HttpResponse } from "msw";

const produtosFake = [
  { _id: "1", name: "Camiseta Azul", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, type: "masculino", releaseDate: "2026-05-14T00:00:00.000Z" },
  { _id: "2", name: "Vestido Floral", mark: "Mynds", color: "Rosa", description: "Verão", price: 129.9, type: "feminino", releaseDate: "2026-05-10T00:00:00.000Z" },
];

export const handlers = [
  http.get("http://localhost:4444/products/", () => {
    return HttpResponse.json({ products: produtosFake });
  }),

  http.post("http://localhost:4444/products/create-product", async ({ request }) => {
    const novoProduto = await request.json();
    return HttpResponse.json({
      message: "Produto criado com sucesso!",
      data: { _id: "3", ...novoProduto },
    });
  }),

  http.put("http://localhost:4444/products/edit-product", async ({ request }) => {
    const produto = await request.json();
    return HttpResponse.json({ message: "Editado com sucesso!", updatedProduct: produto });
  }),

  http.delete("http://localhost:4444/products/delete-product/:id", () => {
    return HttpResponse.json({ message: "Deletado com sucesso!" });
  }),

  http.post("http://localhost:4444/auth/login", async ({ request }) => {
    const { email, password } = await request.json();
    if (email === "aluno@mynds.com" && password === "123456") {
      return HttpResponse.json({ token: "token-de-teste" });
    }
    return HttpResponse.json({ message: "Senha incorreta!" }, { status: 401 });
  }),

  http.post("http://localhost:4444/auth/register", async ({ request }) => {
    const usuario = await request.json();
    return HttpResponse.json({
      message: "Usuario criado com sucesso!",
      data: { _id: "usuario-teste", ...usuario, password: "hash-nao-exposto" },
    });
  }),
];