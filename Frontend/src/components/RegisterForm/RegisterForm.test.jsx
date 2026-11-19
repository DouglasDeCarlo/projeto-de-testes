import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from './RegisterForm';

describe('RegisterForm', () => {
    it("envia todos os campos preenchidos para RegisterHook", async () => {
        const aoRegistrar = vi.fn();
        const user = userEvent.setup();
        render(<RegisterForm registerHook={aoRegistrar}></RegisterForm>)

        const campoNome = screen.getByPlaceholderText("Nome");
        const campoEmail = screen.getByPlaceholderText("Email");
        const campoIdade = screen.getByPlaceholderText("Idade");
        const campoSenha = screen.getByPlaceholderText("Senha");
        const campoConfirmarSenha = screen.getByPlaceholderText("Confirmar senha");
        const botaoRegistrar = screen.getByRole("button", { name: /Registrar/i });

        await user.type(campoNome, "Aluno Teste");
        await user.type(campoEmail, "aluno@mynds.com");
        await user.type(campoIdade, parseInt("21").toString());
        await user.type(campoSenha, "123456");
        await user.type(campoConfirmarSenha, "123456");
        await user.click(botaoRegistrar);

        expect(aoRegistrar).toHaveBeenCalledWith({
            name: "Aluno Teste",
            email: "aluno@mynds.com",
            age: 21,
            password: "123456",
            confirmPassword: "123456",
        });
    });
});
