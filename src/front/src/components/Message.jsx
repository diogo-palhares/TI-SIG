// Mensagem inline (erro/sucesso/info) renderizada como parte da UI.
export default function Message({ type = 'info', children }) {
  if (!children) return null;
  return (
    <div className={`message ${type}`} role="alert" aria-live="assertive">
      {children}
    </div>
  );
}
