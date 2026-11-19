import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/product.js", () => {
    const Product = jest.fn(function ProductMock() {});
    Product.find = jest.fn();
    Product.create = jest.fn();
    Product.findById = jest.fn();
    Product.findByIdAndDelete = jest.fn();
    return { Product };
});

function criaRespostaMock() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const { Product } = await import("../models/product.js")
const { default: ProductController } = await import("./ProductController.js");
const { default: UserController } = await import("./UserController.js");

describe("ProductController", () => {
    beforeEach(() => jest.clearAllMocks());

    it("deleta um produto pelo id da URL", async () => {
        Product.findByIdAndDelete.mockResolvedValue({ _id: "abc123" });
        const req = { params: { id: "abc123" } };
        const res = criaRespostaMock();

        await ProductController.deleteProduct(req, res);

        expect(Product.findByIdAndDelete).toHaveBeenCalledWith("abc123");
        expect(res.json).toHaveBeenCalledWith({ message: "Deletado com sucesso!" });
    });

    it("cria um produto", async () => {
        const payload = { name: "Camiseta", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, imageUrl: "", type: "masculino" };
        Product.create.mockResolvedValue({ _id: "produto-1", ...payload });
        const res = criaRespostaMock();

        await ProductController.createdProduct({ body: payload }, res);

        expect(Product.create).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: "Produto criado com sucesso!",
            data: { _id: "produto-1", ...payload },
        });
    });

    it("informa quando o produto da edição não existe", async () => {
        Product.findById.mockResolvedValue(null);
        const res = criaRespostaMock();

        await ProductController.editProduct({ body: { _id: "inexistente" } }, res);

        expect(res.json).toHaveBeenCalledWith({ message: "Não existe um produto com este ID!" });
    });

    it("edita um produto existente", async () => {
        const produto = { save: jest.fn().mockResolvedValue(undefined) };
        Product.findById
            .mockResolvedValueOnce(produto)
            .mockResolvedValueOnce({ _id: "abc", name: "Novo nome" });
        const res = criaRespostaMock();

        await ProductController.editProduct({ body: { _id: "abc", name: "Novo nome", mark: "Mynds", color: "Azul", description: "", price: 10, type: "outros" } }, res);

        expect(produto.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ updatedProduct: expect.objectContaining({ name: "Novo nome" }) }));
    });
});

describe("authenticateToken", () => {
    it("retorna 401 quando não há authorization", () => {
        const req = { headers: {} };
        const res = criaRespostaMock();
        const next = jest.fn();

        UserController.authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});