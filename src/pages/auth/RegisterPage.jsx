import { useForm } from "react-hook-form";
import { register as registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/renathia_logo.png";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

function PasswordRequirements({ value }) {
  const rules = [
    { label: "Mínimo 8 caracteres", ok: value.length >= 8 },
    { label: "Una letra mayúscula", ok: /[A-Z]/.test(value) },
    { label: "Una letra minúscula", ok: /[a-z]/.test(value) },
    { label: "Un número", ok: /\d/.test(value) },
    { label: "Un carácter especial (!@#$%^&*)", ok: /[!@#$%^&*]/.test(value) },
  ];
  return (
    <ul style={reqStyles.list}>
      {rules.map((r) => (
        <li key={r.label} style={{ ...reqStyles.item, color: r.ok ? "#16a34a" : "#9ca3af" }}>
          <span style={{ marginRight: 6 }}>{r.ok ? "✓" : "○"}</span>{r.label}
        </li>
      ))}
    </ul>
  );
}

const reqStyles = {
  list: { listStyle: "none", margin: "6px 0 0", padding: 0 },
  item: { fontSize: 12, display: "flex", alignItems: "center", marginBottom: 2 },
};

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      if (result.success) {
        setTipo("success");
        setMensaje("¡Cuenta creada! Redirigiendo al inicio de sesión...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setTipo("error");
        setMensaje(result.message);
      }
    } catch {
      setTipo("error");
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src={logo} alt="Renathia Crochet" style={styles.logo} />
          <h1 style={styles.brand}>Renathia Crochet</h1>
          <p style={styles.subtitle}>Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              {...register("fullName", { required: "El nombre es obligatorio" })}
              placeholder="Tu nombre completo"
            />
            {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo no válido" }
              })}
              placeholder="tu@correo.com"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: "La contraseña no cumple los requisitos"
                  }
                })}
                placeholder="Mínimo 8 caracteres"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <PasswordRequirements value={passwordValue} />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label>Teléfono <span style={{ color: "var(--gray)", fontWeight: 400 }}>(opcional)</span></label>
            <input
              {...register("phone")}
              placeholder="Tu número de teléfono"
            />
          </div>

          {mensaje && <div className={`form-message ${tipo}`}>{mensaje}</div>}

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 4 }}>
            Crear cuenta
          </button>
        </form>

        <div style={styles.footer}>
          <span style={{ color: "var(--gray)", fontSize: 13 }}>
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
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
    background: "linear-gradient(135deg, var(--green-light) 0%, var(--pink-light) 100%)",
    padding: "20px",
  },
  card: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(168,216,176,0.2)",
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
  footer: {
    textAlign: "center",
    marginTop: 20,
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
};
