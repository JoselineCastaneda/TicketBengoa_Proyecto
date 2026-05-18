import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";

import {
  FaCcVisa,
  FaCcMastercard,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

import "../../styles/cliente/cliente.css";

const ClienteFooter = () => {
  return (
    <footer className="cliente-footer">
      <div className="cliente-footer-line"></div>

      <div className="cliente-footer-content">
        <div className="cliente-footer-brand">
          <h2>
            Ticket<span>Bengoa</span>
          </h2>

          <div className="footer-small-line"></div>

          <p>Boletos digitales para conciertos y eventos en El Salvador.</p>

          <div className="cliente-footer-socials">
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTiktok /></a>
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        <div className="cliente-footer-section">
          <h3>Contacto</h3>
          <div className="footer-small-line"></div>

          <p><FiMail /> ticketbengoa@gmail.com</p>
          <p><FiPhone /> +503 7000-0000</p>
          <p><FiMapPin /> San Salvador, El Salvador</p>
        </div>

        <div className="cliente-footer-section">
          <h3>Información</h3>
          <div className="footer-small-line"></div>

          <a href="#">Términos y condiciones <FiChevronRight /></a>
          <a href="#">Política de privacidad <FiChevronRight /></a>
        </div>

        <div className="cliente-footer-section">
          <h3>Métodos de pago</h3>
          <div className="footer-small-line"></div>

          <p>Pagos 100% seguros a través de plataformas confiables.</p>

          <div className="cliente-footer-payments">
            <FaCcVisa />
            <FaCcMastercard />
            <FiCreditCard />
          </div>
        </div>
      </div>

      <div className="cliente-footer-copy">
        <FiShield />
        <span>© 2026 TicketBengoa — Todos los derechos reservados.</span>
      </div>
    </footer>
  );
};

export default ClienteFooter;