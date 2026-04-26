import { useForm } from "react-hook-form";
import { login as loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import logo from "../../assets/renathia_logo.png";

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
    } catch {
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={logo} alt="Renathia Crochet" style={styles.logo} />
          <h1 style={styles.brand}>Renathia Crochet</h1>
          <p style={styles.subtitle}>Bienvenida, ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo no válido" }
              })}
              placeholder="tu@correo.com"
              type="email"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "La contraseña es obligatoria" })}
                placeholder="Tu contraseña"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {mensaje && <div className="form-message error">{mensaje}</div>}

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
            Iniciar sesión
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
          <span style={{ color: "var(--gray)", fontSize: 13 }}>
            ¿No tienes cuenta? <a href="/registro">Regístrate</a>
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 66px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, var(--pink-light) 0%, var(--green-light) 100%)",
    padding: "20px",
  },
  card: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(212,132,154,0.18)",
    padding: "40px 40px 32px",
    width: "100%",
    maxWidth: 420,
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: 28,
  },
  logo: {
    height: 60,
    objectFit: "contain",
    marginBottom: 10,
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--pink-dark)",
    margin: "0 0 4px",
  },
  subtitle: {
    fontSize: 14,
    color: "var(--gray)",
    margin: 0,
  },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    padding: 0,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    fontSize: 14,
  },
};
