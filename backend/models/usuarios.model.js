import db from "../config/database.js";

const UsuariosModel = {
  async getAll() {
    try {
      const query = `SELECT id_usuario, nombre, email, telefono, fecha_registro FROM usuarios`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const query = `SELECT id_usuario, nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, fecha_nacimiento, fecha_registro FROM usuarios WHERE id_usuario = $1`;
      const result = await db.query(query, [id]);

      const usuario = result.rows[0] || null;

      // Combine nombre and apellido for frontend
      if (usuario && usuario.apellido) {
        usuario.nombre = `${usuario.nombre} ${usuario.apellido}`;
      }

      return usuario;
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  async findByEmail(email) {
    try {
      const query = `SELECT * FROM usuarios WHERE email = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en findByEmail:", error);
      throw error;
    }
  },

  async create(data) {
    try {
      let {
        nombre,
        email,
        password,
        telefono,
        direccion,
        ciudad,
        codigo_postal,
        fecha_nacimiento,
      } = data;

      // If frontend sends a full name in `nombre`, try to split into nombre / apellido
      let apellido = "";
      if (nombre && nombre.includes(" ")) {
        const parts = nombre.trim().split(/\s+/);
        nombre = parts.shift();
        apellido = parts.join(" ");
      }

      // Ensure we also populate password_hash column (some DB schemas require it)
      const query = `
        INSERT INTO usuarios (nombre, apellido, email, password, password_hash, telefono, direccion, ciudad, codigo_postal, fecha_nacimiento)
        VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9)
        RETURNING id_usuario, nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, fecha_nacimiento, fecha_registro
      `;
      const result = await db.query(query, [
        nombre,
        apellido,
        email,
        password,
        telefono || "",
        direccion || "",
        ciudad || "",
        codigo_postal || "",
        fecha_nacimiento || null,
      ]);

      const usuario = result.rows[0];

      // Combine nombre and apellido for frontend
      if (usuario && usuario.apellido) {
        usuario.nombre = `${usuario.nombre} ${usuario.apellido}`;
      }

      return usuario;
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      // If updating nombre, split into nombre/apellido if needed
      if (data.nombre && data.nombre.includes(" ") && !data.apellido) {
        const parts = data.nombre.trim().split(/\s+/);
        data.nombre = parts.shift();
        data.apellido = parts.join(" ");
      }

      // If password is being updated, also update password_hash
      if (data.password) {
        data.password_hash = data.password;
      }

      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields
        .map((field, i) => `${field} = $${i + 1}`)
        .join(", ");

      const query = `UPDATE usuarios SET ${setClause} WHERE id_usuario = $${
        fields.length + 1
      } RETURNING id_usuario, nombre, apellido, email, telefono, direccion, ciudad, codigo_postal, fecha_nacimiento, fecha_registro`;
      const result = await db.query(query, [...values, id]);

      const usuario = result.rows[0];

      // Combine nombre and apellido for frontend
      if (usuario && usuario.apellido) {
        usuario.nombre = `${usuario.nombre} ${usuario.apellido}`;
      }

      return usuario;
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const query = `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};

export default UsuariosModel;
