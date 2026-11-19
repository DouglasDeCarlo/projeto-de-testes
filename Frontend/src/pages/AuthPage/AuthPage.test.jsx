import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";

function renderAuth() {
  return render(<MemoryRouter><AuthPage /></MemoryRouter>);
}

describe("AuthPage", () => {
  beforeEach(() => localStorage.clear());

  it("mostra erro quando o login falha", async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText(/já tem conta/i));
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Senha incorreta!")).toBeInTheDocument();
  });

  it("salva o token e entra quando o login é válido", async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.click(screen.getByText(/já tem conta/i));
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(localStorage.getItem("token")).toBe("token-de-teste"));
  });

  it("registra com sucesso e troca para a tela de login", async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByPlaceholderText("Nome"), "Aluno Teste");
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Idade"), "21");
    await user.type(screen.getByPlaceholderText("Senha"), "123456");
    await user.type(screen.getByPlaceholderText("Confirmar senha"), "123456");
    await user.click(screen.getByRole("button", { name: /registrar/i }));

    expect(await screen.findByText(/Conta criada com sucesso/i)).toBeInTheDocument();
    expect(await screen.findByText("Faça seu Login")).toBeInTheDocument();
  });
});
