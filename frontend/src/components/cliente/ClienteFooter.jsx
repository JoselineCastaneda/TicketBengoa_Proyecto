import "../../styles/cliente/cliente.css";

const ClienteFooter = () => {
  return (
    <footer className="cliente-footer">
      <div>
        <h2>TicketBengoa</h2>
        <p>Venta digital de boletos para eventos en el Estadio Bengoa.</p>
      </div>

      <div>
        <h3>Contacto</h3>
        <p>ticketbengoa@gmail.com</p>
        <p>+503 7000-0000</p>
        <p>San Salvador, El Salvador</p>
      </div>

      <div>
        <h3>Accesos</h3>
        <p>Eventos</p>
        <p>Mis boletos</p>
        <p>Términos y condiciones</p>
      </div>

      <div>
        <h3>Métodos de pago</h3>
        <p>Visa</p>
        <p>Mastercard</p>
      </div>
    </footer>
  );
};

export default ClienteFooter;