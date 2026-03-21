import { useForm } from "react-hook-form";
import { login as loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const result = await loginUser(data);
      if (result.success) {
        login(result, result.token);
        navigate("/catalogo");
      } else {
        setMensaje(result.message);
      }
    } catch (error) {
      setMensaje("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Iniciar sesión - RENATHIA CROCHET</h2>
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

        <div style={{ marginBottom: "15px" }}>
          <label>Contraseña</label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "La contraseña es obligatoria" })}
              placeholder="Tu contraseña"
              style={{ width: "100%", padding: "8px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: "8px", padding: "8px", cursor: "pointer" }}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>

        {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#6B2D8B", color: "white", border: "none", cursor: "pointer" }}>
          Iniciar sesión
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
      </p>
      <p style={{ textAlign: "center" }}>
        ¿No tienes cuenta? <a href="/registro">Regístrate</a>
      </p>
    </div>
  );
}