import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

function renderNavbar(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar — segurança da sessão", () => {
  beforeEach(() => localStorage.clear());

  it("não oferece logout quando não existe token", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sair/i })).not.toBeInTheDocument();
  });

  it("exibe logout somente quando há token", () => {
    localStorage.setItem("token", "token-falso");
    renderNavbar("/products");

    expect(screen.getByRole("button", { name: /sair/i })).toBeInTheDocument();
  });

  it("remove completamente o token ao sair", async () => {
    const user = userEvent.setup();
    localStorage.setItem("token", "token-falso");
    renderNavbar("/products");

    await user.click(screen.getByRole("button", { name: /sair/i }));

    expect(localStorage.getItem("token")).toBeNull();
  });

  it("não mostra uma rota protegida baseada apenas em texto do token vazio", () => {
    localStorage.setItem("token", "");
    renderNavbar();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });
});
