import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../../services/authService";
import logo from "../../assets/renathia_logo.png";

/**
 * Página de restablecimiento de contraseña.
 * Lee token y email de los query params del enlace enviado por correo.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data) => {
    try {
      const result = await resetPassword({ email, token, newPassword: data.newPassword });
      if (result.success) {
        setExito(true);
        setMensaje(result.message);
        setTimeout(() => navigate("/login"), 3000);
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
          <p style={styles.subtitle}>Crea tu nueva contraseña</p>
        </div>

        {exito ? (
          <div className="form-message" style={styles.successBox}>
            <p style={{ margin: 0 }}>{mensaje}</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--gray)" }}>
              Redirigiendo al inicio de sesión…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  style={{ paddingRight: 44 }}
                  {...register("newPassword", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repite tu contraseña"
                  style={{ paddingRight: 44 }}
                  {...register("confirmPassword", {
                    required: "Confirma tu contraseña",
                    validate: (v) => v === watch("newPassword") || "Las contraseñas no coinciden",
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            {mensaje && <div className="form-message error">{mensaje}</div>}

            <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
              Restablecer contraseña
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <a href="/login">Volver al inicio de sesión</a>
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
  successBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: 8,
    padding: "16px",
    textAlign: "center",
    color: "#166534",
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
