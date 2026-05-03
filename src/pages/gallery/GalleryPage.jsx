import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApprovedGallery, uploadGalleryPhoto, deleteGalleryPhoto } from "../../services/galleryService";

export default function GalleryPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    try {
      const data = await getApprovedGallery();
      setPhotos(Array.isArray(data) ? data : []);
    } catch {
      setMensaje("Error al cargar la galería");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) { setUploadError("Selecciona una imagen"); return; }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (caption.trim()) formData.append("caption", caption.trim());
      await uploadGalleryPhoto(formData);
      setShowModal(false);
      setCaption("");
      setImageFile(null);
      setPreview(null);
      setMensaje("Foto enviada. Quedará visible después de ser aprobada.");
    } catch {
      setUploadError("Error al subir la foto. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      await deleteGalleryPhoto(id);
      setPhotos(prev => prev.filter(p => p.galleryId !== id));
    } catch {
      alert("No se pudo eliminar la foto.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCaption("");
    setImageFile(null);
    setPreview(null);
    setUploadError("");
  };

  return (
    <div className="page">
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: "var(--pink-dark)" }}>Galería</h2>
          <p style={{ margin: "4px 0 0", color: "var(--gray)", fontSize: 14 }}>
            Fotos de nuestra comunidad
          </p>
        </div>
        {user?.roleId === 2 && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Subir mi foto
          </button>
        )}
      </div>

      {mensaje && (
        <div style={styles.notice}>{mensaje}</div>
      )}

      {photos.length === 0 && !mensaje ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 40 }}>📷</span>
          <p style={{ color: "var(--gray)", marginTop: 10 }}>
            Aún no hay fotos aprobadas en la galería.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {photos.map(photo => (
            <div key={photo.galleryId} style={styles.card}>
              <img src={photo.imageUrl} alt={photo.caption || "Foto galería"} style={styles.img} />
              <div style={styles.cardBody}>
                {photo.caption && (
                  <p style={styles.caption}>{photo.caption}</p>
                )}
                <div style={styles.cardFooter}>
                  <span style={styles.userName}>{photo.userName || "Cliente"}</span>
                  {(user?.roleId === 1 || (user?.roleId === 2 && user?.userId == photo.userId)) && (
                    <button style={styles.deleteBtn} onClick={() => handleDelete(photo.galleryId)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal subir foto */}
      {showModal && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", color: "var(--pink-dark)" }}>Subir mi foto</h3>
            <form onSubmit={handleUpload}>
              <div style={styles.field}>
                <label style={styles.label}>Imagen *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                {preview && (
                  <img src={preview} alt="Vista previa" style={styles.preview} />
                )}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Descripción (opcional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Ej: Mi amigurumi favorito"
                  maxLength={200}
                  style={styles.input}
                />
              </div>
              {uploadError && (
                <p style={{ color: "var(--red, #e53e3e)", fontSize: 13, margin: "0 0 12px" }}>
                  {uploadError}
                </p>
              )}
              <p style={{ fontSize: 12, color: "var(--gray)", margin: "0 0 16px" }}>
                Tu foto quedará pendiente de aprobación antes de aparecer en la galería.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? "Subiendo..." : "Enviar foto"}
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
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  notice: {
    background: "var(--green-light)",
    color: "var(--green-dark)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--white)",
    borderRadius: 16,
    boxShadow: "var(--shadow)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20,
  },
  card: {
    background: "var(--white)",
    borderRadius: 14,
    boxShadow: "var(--shadow)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  img: {
    width: "100%",
    height: 220,
    objectFit: "cover",
  },
  cardBody: {
    padding: "12px 14px 14px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  caption: {
    margin: "0 0 8px",
    fontSize: 14,
    color: "var(--gray-dark)",
    lineHeight: 1.4,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  userName: {
    fontSize: 12,
    color: "var(--gray)",
    fontStyle: "italic",
  },
  deleteBtn: {
    background: "transparent",
    border: "1.5px solid var(--border)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    color: "var(--gray)",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "var(--white)",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--gray-dark)",
    marginBottom: 6,
  },
  fileInput: {
    width: "100%",
    fontSize: 14,
    fontFamily: "inherit",
  },
  preview: {
    marginTop: 10,
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: 8,
    border: "1.5px solid var(--border)",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid var(--border)",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },
};
