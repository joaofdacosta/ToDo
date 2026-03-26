export default function Botao({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ margin: '5px', cursor: 'pointer' }}>
      {children}
    </button>
  );
}