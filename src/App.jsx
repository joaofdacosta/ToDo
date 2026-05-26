import { useState } from "react";
import Botao from "./Botao.jsx"; 

export default function App() {
  const [ToDo, setToDo] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  
  function adicionar() {
    if (nome === "" || quantidade <= 0) {
      return;
    }

    console.log(ToDo);

    const produto = {
      "id": Math.random(), 
      nome,
      quantidade: Number(quantidade),
      comprado: false 
    }

    setToDo([...ToDo, produto]);
    setNome("");
    setQuantidade(0);

    console.log(ToDo);
  }

  function removerItem(idProduto) {
    const listaFiltrada = ToDo.filter(item => item.id !== idProduto);
    setToDo(listaFiltrada);
  }

  function adicionarQuantidade(idProduto) {
    const listaProdutosAtualizada = ToDo.map(produto => {
      if (produto.id === idProduto) {
        return { ...produto, quantidade: Number(produto.quantidade) + 1 };
      }
      return produto;
    });
    setToDo(listaProdutosAtualizada);
  }

  function alternarComprado(idProduto) {
    const listaAtualizada = ToDo.map(produto => {
      if (produto.id === idProduto) {
        return { ...produto, comprado: !produto.comprado };
      }
      return produto;
    });
    setToDo(listaAtualizada);
  }

  return (
    <main>
      <h1>Carrinho Antes - Loja Saldão Do Baú</h1>

      <div>
        <div>
          <label htmlFor="name">Nome Produto: </label>
          <input id="name" type="text" value={nome} onChange={e => setNome(e.target.value)} />
        </div>

        <div>
          <label htmlFor="qtd">Quantidade: </label>
          <input id="qtd" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
        </div>

        <Botao onClick={adicionar}>Adicionar ao Carrinho</Botao>
      </div>

      <div>
        <h2>Itens do Carrinho ({ToDo.length})</h2>
        {ToDo.map(item => (
          <div>
            
            <input 
              type="checkbox" 
              checked={item.comprado} 
              onChange={() => alternarComprado(item.id)} 
            />

            <span style={{ textDecoration: item.comprado ? "line-through" : "none", marginLeft: "10px" }}>
              <strong>{item.nome}</strong> - Qtd: {item.quantidade}
            </span>

            <div style={{ marginTop: "10px" }}>
              <Botao onClick={() => adicionarQuantidade(item.id)}>+ Quantidade</Botao>
              <Botao onClick={() => removerItem(item.id)}>Remover</Botao>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}