// Este componente es opcional - puedes usarlo si prefieres crear emails con React
// en lugar de HTML plano (más avanzado)

import type * as React from "react"

interface EmailTemplateProps {
  firstName: string
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ firstName }) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
    <div style={{ backgroundColor: "#9c6644", color: "white", padding: "20px", textAlign: "center" }}>
      <h1>ZAHARA</h1>
      <p>Moda y fragancias que definen tu estilo</p>
    </div>

    <div style={{ padding: "20px" }}>
      <h2>¡Bienvenido a Zahara, {firstName}!</h2>

      <p>Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.</p>

      <div
        style={{
          backgroundColor: "#f8f4f1",
          border: "1px solid #e4d4c8",
          padding: "15px",
          margin: "15px 0",
          borderRadius: "5px",
        }}
      >
        <h3>TU REGALO DE BIENVENIDA</h3>
        <p>
          Como agradecimiento por tu suscripción, queremos ofrecerte un <strong>20% de descuento</strong> en tu primera
          compra.
        </p>

        <div
          style={{
            backgroundColor: "#9c6644",
            color: "white",
            padding: "10px",
            textAlign: "center",
            fontWeight: "bold",
            margin: "15px 0",
          }}
        >
          CÓDIGO: BIENVENIDA20
        </div>

        <p>
          <small>Válido durante los próximos 30 días en cualquier producto de nuestra tienda.</small>
        </p>
      </div>

      <h3>Beneficios exclusivos para miembros:</h3>
      <ul style={{ margin: "15px 0" }}>
        <li>Acceso anticipado a nuevas colecciones</li>
        <li>Ofertas exclusivas para suscriptores</li>
        <li>Consejos de estilo personalizados</li>
        <li>Invitaciones a eventos especiales</li>
      </ul>

      <p>¡Esperamos verte pronto en Zahara!</p>

      <p>
        Atentamente,
        <br />
        El equipo de Zahara
      </p>
    </div>

    <div style={{ backgroundColor: "#f1f1f1", padding: "15px", textAlign: "center", fontSize: "12px", color: "#666" }}>
      <p>&copy; {new Date().getFullYear()} Zahara. Todos los derechos reservados.</p>
      <p>
        Si no deseas recibir más correos, puedes <a href="#">darte de baja aquí</a>.
      </p>
    </div>
  </div>
)

