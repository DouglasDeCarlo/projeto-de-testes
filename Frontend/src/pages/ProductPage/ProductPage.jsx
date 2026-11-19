import React, {useEffect, useState, useCallback} from "react";
import "./ProductPage.css";
import AddNewButton from "../../components/UI/AddNewButton/AddNewButton";
import Modal from "../../components/Modal/Modal";
import axios from "axios";
import Product from "../../components/Product/Product";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import { CATEGORY_LIST } from "../../fn-helpers/categories.jsx";
import {useNavigate} from "react-router-dom";


function ProductPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("todos");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4444";

  const pegarTodasAsProductsDaApi = useCallback(() => {
    axios
      .get(`${apiUrl}/products/`)
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => console.error("erro ao pegar os dados da api", err));
  }, [apiUrl]);

  const createProduct = async (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.alert("Você precisa estar logado para cadastrar produtos. Faça login.");
      navigate("/auth");
      return;
    }
    await axios
      .post(`${apiUrl}/products/create-product`, {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProducts((atuais) => [...atuais, res.data.data]);
      })
      .catch((err) => console.error("erro ao criar produto", err));
  };

  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token")
    await axios
      .delete(`${apiUrl}/products/delete-product/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setProducts((atuais) => atuais.filter((n) => n._id !== id));
      })
      .catch((err) => console.error("erro ao deletar produto", err));
  };

  const editProduct = (name, mark, color, description, price, releaseDate, id, imageUrl, type) => {
    const token = localStorage.getItem("token")
    axios
      .put(`${apiUrl}/products/edit-product`, {
        name,
        mark,
        color,
        description,
        price,
        imageUrl: imageUrl || undefined,
        type: type || undefined,
        releaseDate: releaseDate || undefined,
        _id: id,
      }, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setProducts((atuais) => atuais.map((n) => n._id === id ? res.data.updatedProduct : n));
      })
      .catch((err) => console.error("erro ao editar produto", err));
  };

  useEffect(() => {
    pegarTodasAsProductsDaApi();
  }, [pegarTodasAsProductsDaApi]);

  const mudarModal = () => {
    setShowModal((state) => !state);
  };

  const filteredProducts = filter === "todos" ? products: products.filter((p) => p.type === filter);

  return (
    <div className="product-page">
      <AddNewButton abrirOModal={mudarModal} />
      {showModal ? (
        <Modal createProduct={createProduct} fecharOModal={mudarModal} />
      ) : null}
      {editingProduct ? (
        <Modal
          createProduct={editProduct}
          editingProduct={editingProduct}
          fecharOModal={() => setEditingProduct(null)}
        />
      ) : null}
      <div className="product-page-header">
        <h1>Produtos</h1>
        <p>Explore, cadastre e gerencie os produtos do catálogo.</p>
      </div>
      <div className="category-list">
        {CATEGORY_LIST.map((cat) => (
          <CategoryCard
            key={cat.key}
            icon={cat.icon}
            label={cat.label}
            accent={cat.accent}
            active={filter === cat.key}
            count={cat.key === "todos" ? products.length : products.filter((p) => p.type === cat.key).length}
            onClick={() => setFilter(cat.key)}
          />
        ))}
      </div>
      {filteredProducts.length === 0 ? (
        <div className="product-page-empty">
          <p>Nenhum produto encontrado{filter !== "todos" ? ` para "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="Productslist">
          {filteredProducts.map((n) => (
            <Product
              key={n._id}
              {...n}
              deleteProduct={deleteProduct}
              editProduct={editProduct}
              setEditMode={(data) => setEditingProduct(data)}
            />
          ))}
        </div>
      )}
      <button
        className="support-button"
        onClick={() => navigate("/chatpage")}
        aria-label="Falar com o suporte"
        title="Falar com o suporte"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>Suporte</span>
      </button>
    </div>
  );
}

export default ProductPage;