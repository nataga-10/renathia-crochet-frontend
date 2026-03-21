import { useForm } from "react-hook-form";
import { register as registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      if (result.success) {
        setMensaje("¡Registro exitoso! Redirigiendo...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMensaje(result.message);
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Crear cuenta - RENATHIA CROCHET</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "15px" }}>
          <label>Nombre completo</label>
          <input
            {...register("fullName", { required: "El nombre es obligatorio" })}
            placeholder="Tu nombre completo"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.fullName && <p style={{ color: "red" }}>{errors.fullName.message}</p>}
        </div>

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

        <div style={{ marginBottom: "15px" }}>
          <label>Contraseña</label>
          <input
            type="password"
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: { value: 8, message: "La contraseña debe tener mínimo 8 caracteres" }
            })}
            placeholder="Mínimo 8 caracteres"
            style={{ width: "100%", padding: "8px" }}
          />
          {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>

        {mensaje && <p style={{ color: "blue" }}>{mensaje}</p>}

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer" }}>
          Registrarse
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
      </p>
    </div>
  );
}