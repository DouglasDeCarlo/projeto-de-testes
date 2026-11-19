import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";

describe("Form", () => {
  it("preenche os campos ao receber editingProduct", () => {
    render(
      <Form
        editingProduct={{ _id: "10", name: "Bermuda", mark: "Mynds", color: "Preta", description: "Básica", price: 79.9, releaseDate: "2026-05-14T00:00:00.000Z", imageUrl: "", type: "masculino" }}
        createProduct={() => {}}
        fecharOModal={() => {}}
      />
    );

    expect(screen.getByLabelText("Nome")).toHaveValue("Bermuda");
    expect(screen.getByLabelText("Marca")).toHaveValue("Mynds");
    expect(screen.getByLabelText("Cor")).toHaveValue("Preta");
    expect(screen.getByLabelText("Preço")).toHaveValue(79.9);
  });

  it("envia o id do produto ao editar", async () => {
    const criar = vi.fn();
    const fechar = vi.fn();
    const user = userEvent.setup();
    render(<Form editingProduct={{ _id: "10", name: "Bermuda", mark: "Mynds", color: "Preta", description: "", price: 79.9, type: "masculino" }} createProduct={criar} fecharOModal={fechar} />);

    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Bermuda Premium");
    await user.click(screen.getByRole("button", { name: /editar produto/i }));

    expect(criar).toHaveBeenCalledWith("Bermuda Premium", "Mynds", "Preta", "", 79.9, "", "10", "", "masculino");
    expect(fechar).toHaveBeenCalledTimes(1);
  });
});
