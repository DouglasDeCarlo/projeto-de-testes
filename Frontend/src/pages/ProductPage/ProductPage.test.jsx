import {describe, it, expect, vi} from "vitest";
import { render, screen } from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ProductPage from "./ProductPage";

function renderComRouter(ui){
    return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe("ProductPage(API MOCK)", () => {
    it("Carrega e exibe os produtos vindos da API", async () => {
        renderComRouter(<ProductPage></ProductPage>)
        expect(await screen.findByText("Camiseta Azul")).toBeInTheDocument();
        expect(screen.getByText("Vestido Floral")).toBeInTheDocument();
    })
});