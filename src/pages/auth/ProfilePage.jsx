import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/authService";

const ROLE_LABELS = { 1: "Administrador", 2: "Cliente", 3: "Vendedor" };
const DOCUMENT_TYPES = ["CC", "NIT", "Pasaporte", "CE"];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ text: "", error: false });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile(token);
      setProfile(data);
      setForm({
        fullName: data.fullName || "",
        phone: data.phone || "",
        documentType: data.documentType || "",
        documentNumber: data.documentNumber || "",
      });
    } catch {
      setMensaje({ text: "Error al cargar el perfil", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setMensaje({ text: "El nombre es obligatorio", error: true });
      return;
    }
    setSaving(true);
    setMensaje({ text: "", error: false });
    try {
      await updateProfile(token, form);
      setMensaje({ text: "Perfil actualizado exitosamente", error: false });
      await loadProfile();
    } catch {
      setMensaje({ text: "Error al actualizar el perfil", error: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p style={{ color: "var(--gray)" }}>Cargando perfil...</p></div>;

  return (
    <div className="page">
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Mi perfil</h2>
      </div>

      <div style={styles.layout}>
        {/* Tarjeta de resumen */}
        <div style={styles.card}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>
              {profile?.fullName?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
          <p style={styles.name}>{profile?.fullName}</p>
          <span style={styles.roleBadge}>{ROLE_LABELS[profile?.roleId]}</span>
          <p style={styles.email}>{profile?.email}</p>
          <p style={styles.since}>
            Miembro desde {new Date(profile?.createdAt).toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
          </p>

          {/* Datos de solo lectura */}
          <div style={styles.infoList}>
            {profile?.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Teléfono</span>
                <span style={styles.infoValue}>{profile.phone}</span>
              </div>
            )}
            {profile?.documentType && profile?.documentNumber && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>{profile.documentType}</span>
                <span style={styles.infoValue}>{profile.documentNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Editar información</h3>

          {mensaje.text && (
            <div style={{ ...styles.alert, background: mensaje.error ? "#ffeaea" : "#eafaf1", color: mensaje.error ? "#c0392b" : "#27ae60", borderColor: mensaje.error ? "#f5c6cb" : "#a9dfbf" }}>
              {mensaje.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nombre completo *</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Tu nombre completo"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                value={profile?.email}
                disabled
                style={{ background: "var(--pink-light)", color: "var(--gray)", cursor: "not-allowed" }}
                title="El correo no se puede cambiar"
              />
              <span style={styles.hint}>El correo no se puede modificar</span>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Teléfono</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
                maxLength={20}
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label style={styles.label}>Tipo de documento</label>
                <select name="documentType" value={form.documentType} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...styles.fieldGroup, flex: 2 }}>
                <label style={styles.label}>Número de documento</label>
                <input
                  name="documentNumber"
                  value={form.documentNumber}
                  onChange={handleChange}
                  placeholder="Ej: 1000123456"
                  maxLength={20}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ marginTop: 8, width: "100%" }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: 24 },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 24,
    alignItems: "start",
  },
  card: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  avatarWrap: { marginBottom: 14 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--pink), var(--green))",
    color: "white",
    fontWeight: 700,
    fontSize: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { margin: "0 0 6px", fontWeight: 700, fontSize: 18, color: "var(--gray-dark)" },
  roleBadge: {
    background: "var(--green-light)",
    color: "var(--green-dark)",
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 12px",
    borderRadius: 20,
  },
  email: { margin: "10px 0 4px", fontSize: 13, color: "var(--gray)" },
  since: { margin: "0 0 16px", fontSize: 12, color: "var(--gray)", fontStyle: "italic" },
  infoList: { width: "100%", borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4 },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: 13,
    borderBottom: "1px solid var(--border)",
  },
  infoLabel: { color: "var(--gray)", fontWeight: 500 },
  infoValue: { color: "var(--gray-dark)", fontWeight: 600 },
  formCard: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
    padding: "28px 24px",
  },
  formTitle: { margin: "0 0 20px", color: "var(--pink-dark)", fontSize: 17, fontWeight: 700 },
  alert: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid",
    marginBottom: 16,
    fontSize: 14,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--gray-dark)" },
  hint: { fontSize: 11, color: "var(--gray)", marginTop: 2 },
  row: { display: "flex", gap: 12 },
};
