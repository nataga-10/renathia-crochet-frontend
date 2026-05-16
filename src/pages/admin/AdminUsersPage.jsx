import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/usersAdminService";

const ROLE_LABELS = { 1: "Admin", 2: "Cliente", 3: "Vendedor" };
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = crear, objeto = editar

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setMensaje("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    reset({ fullName: "", email: "", password: "", phone: "", roleId: 2, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    reset({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? "",
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setMensaje("");
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.userId, {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || null,
          roleId: Number(data.roleId),
          isActive: data.isActive,
        });
      } else {
        await createUser({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          phone: data.phone || null,
          roleId: Number(data.roleId),
        });
      }
      closeModal();
      loadUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al guardar el usuario";
      setMensaje(msg);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Estás segura de eliminar a ${user.fullName}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteUser(user.userId);
      loadUsers();
    } catch {
      setMensaje("Error al eliminar el usuario");
    }
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Gestión de Usuarios</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginTop: 4 }}>
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrados
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
      </div>

      {mensaje && !modalOpen && (
        <div className="form-message error" style={{ marginBottom: 16 }}>{mensaje}</div>
      )}

      {loading ? (
        <p style={{ color: "var(--gray)", textAlign: "center", padding: 40 }}>Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 48 }}>👥</span>
          <p style={{ color: "var(--gray)", marginTop: 12 }}>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.userId} style={{ background: i % 2 === 0 ? "var(--white)" : "var(--pink-light)" }}>
                  <td style={styles.td}>#{u.userId}</td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{u.fullName}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.phone ?? "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.roleBadge, ...(u.roleId === 1 ? styles.roleAdmin : u.roleId === 3 ? styles.roleSeller : styles.roleClient) }}>
                      {ROLE_LABELS[u.roleId] ?? `Rol ${u.roleId}`}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, background: u.isActive ? "var(--green-light)" : "#FDE8EF", color: u.isActive ? "var(--green-dark)" : "var(--pink-dark)" }}>
                      {u.isActive ? "Activo" : "Bloqueado"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={styles.btnEdit} onClick={() => openEdit(u)}>Editar</button>
                      <button style={styles.btnDelete} onClick={() => handleDelete(u)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear / editar */}
      {modalOpen && (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: "var(--pink-dark)" }}>
                {editingUser ? "Editar usuario" : "Nuevo usuario"}
              </h3>
              <button style={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  {...register("fullName", { required: "El nombre es obligatorio" })}
                  placeholder="Nombre completo"
                />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: { value: /^\S+@\S+$/i, message: "Correo no válido" }
                  })}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "La contraseña es obligatoria",
                      pattern: {
                        value: PASSWORD_REGEX,
                        message: "Mínimo 8 caracteres, una mayúscula, minúscula, número y carácter especial"
                      }
                    })}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>
              )}

              <div className="form-group">
                <label>Teléfono <span style={{ color: "var(--gray)", fontWeight: 400 }}>(opcional)</span></label>
                <input {...register("phone")} placeholder="Número de teléfono" />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select {...register("roleId", { required: true })} style={styles.select}>
                  <option value={2}>Cliente</option>
                  <option value={3}>Vendedor</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>

              {editingUser && (
                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="checkbox" id="isActive" {...register("isActive")} style={{ width: "auto" }} />
                  <label htmlFor="isActive" style={{ margin: 0 }}>Cuenta activa</label>
                </div>
              )}

              {mensaje && <div className="form-message error">{mensaje}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingUser ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "linear-gradient(90deg, var(--pink) 0%, var(--green) 100%)" },
  th: { padding: "14px 16px", textAlign: "left", color: "white", fontWeight: 600, fontSize: 14 },
  td: { padding: "12px 16px", fontSize: 14, borderBottom: "1px solid var(--border)" },
  roleBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  roleAdmin: { background: "#FDE8EF", color: "var(--pink-dark)" },
  roleSeller: { background: "#FEF3C7", color: "#92400E" },
  roleClient: { background: "var(--green-light)", color: "var(--green-dark)" },
  statusBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  btnEdit: {
    background: "var(--pink-light)", color: "var(--pink-dark)",
    border: "1px solid var(--pink)", borderRadius: 6,
    padding: "5px 12px", fontSize: 13, cursor: "pointer", fontWeight: 500,
  },
  btnDelete: {
    background: "#FDE8EF", color: "#C0405A",
    border: "1px solid #F4A7BB", borderRadius: 6,
    padding: "5px 12px", fontSize: 13, cursor: "pointer", fontWeight: 500,
  },
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 500, padding: 20,
  },
  modal: {
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    padding: "32px",
    width: "100%",
    maxWidth: 480,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24,
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "var(--gray)", lineHeight: 1,
  },
  select: {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid var(--border)", fontSize: 14,
    fontFamily: "inherit", background: "var(--white)",
  },
};
