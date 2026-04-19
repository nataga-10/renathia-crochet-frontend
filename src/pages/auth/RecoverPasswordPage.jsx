import { useForm } from "react-hook-form";
import { recoverPassword } from "../../services/authService";
import { useState } from "react";

/**
 * Página de recuperación de contraseña.
 * Solo solicita el correo. El backend siempre retorna el mismo mensaje
 * para no revelar si el correo existe en el sistema (práctica de seguridad).
 */
export default function RecoverPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [mensaje, setMensaje] = useState("");

  /** Envía la solicitud de recuperación y muestra el mensaje del backend. */
  const onSubmit = async (data) => {
    try {
      const result = await recoverPassword(data.email);
      setMensaje(result.message);
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Recuperar contraseña - RENATHIA CROCHET</h2>
      <p>Ingresa tu correo y te enviaremos las instrucciones.</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "15px" }}>
          <label>Correo electrónico</label>
          <input
            {...register("email", {
              required: "El correo es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Correo no válido" }
            })}
            placeholder="tu@correo.com"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>

        {mensaje && <p style={{ color: "blue" }}>{mensaje}</p>}

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer" }}>
          Enviar instrucciones
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        <a href="/login">Volver al inicio de sesión</a>
      </p>
    </div>
  );
}