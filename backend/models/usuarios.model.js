
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
  
  static async getAll() {
    const queryText = `
      SELECT 
        id_usuario, nombre, apellido, email, telefono, 
        direccion, ciudad, codigo_postal, fecha_nacimiento,
        activo, fecha_registro
      FROM usuarios
      WHERE activo = true
      ORDER BY fecha_registro DESC
    `;

    const result = await query(queryText);
    return result.rows;
  }

  static async getById(id) {
    const queryText = `
      SELECT 
        id_usuario, nombre, apellido, email, telefono, 
        direccion, ciudad, codigo_postal, fecha_nacimiento,
        activo, fecha_registro
      FROM usuarios
      WHERE id_usuario = $1 AND activo = true
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }

  static async getByEmail(email) {
    const queryText = `
      SELECT * FROM usuarios 
      WHERE email = $1 AND activo = true
    `;

    const result = await query(queryText, [email]);
    return result.rows[0];
  }

  static async create(usuarioData) {
    const {
      nombre,
      apellido,
      email,
      password,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      fecha_nacimiento
    } = usuarioData;

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const queryText = `
      INSERT INTO usuarios (
        nombre, apellido, email, password_hash, telefono,
        direccion, ciudad, codigo_postal, fecha_nacimiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_usuario, nombre, apellido, email, telefono, 
                direccion, ciudad, codigo_postal, fecha_registro
    `;

    const result = await query(queryText, [
      nombre,
      apellido,
      email,
      password_hash,
      telefono || null,
      direccion || null,
      ciudad || null,
      codigo_postal || null,
      fecha_nacimiento || null
    ]);

    return result.rows[0];
  }

  static async update(id, usuarioData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Si se incluye password, hashearlo
    if (usuarioData.password) {
      const salt = await bcrypt.genSalt(10);
      usuarioData.password_hash = await bcrypt.hash(usuarioData.password, salt);
      delete usuarioData.password;
    }

    Object.keys(usuarioData).forEach(key => {
      if (usuarioData[key] !== undefined && key !== 'email') { // Email no se puede cambiar
        fields.push(`${key} = $${paramCount}`);
        values.push(usuarioData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);

    const queryText = `
      UPDATE usuarios 
      SET ${fields.join(', ')}
      WHERE id_usuario = $${paramCount}
      RETURNING id_usuario, nombre, apellido, email, telefono, 
                direccion, ciudad, codigo_postal, fecha_registro
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }

  static async delete(id) {
    const queryText = `
      UPDATE usuarios 
      SET activo = false 
      WHERE id_usuario = $1
      RETURNING id_usuario, nombre, email
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Obtener estadísticas del usuario
  static async getUserStats(id) {
    const queryText = `
      SELECT 
        COUNT(DISTINCT pe.id_pedido) as total_pedidos,
        COALESCE(SUM(pe.total), 0) as total_gastado,
        COUNT(DISTINCT v.id_valoracion) as total_valoraciones
      FROM usuarios u
      LEFT JOIN pedidos pe ON u.id_usuario = pe.id_usuario
      LEFT JOIN valoraciones v ON u.id_usuario = v.id_usuario
      WHERE u.id_usuario = $1
      GROUP BY u.id_usuario
    `;

    const result = await query(queryText, [id]);
    return result.rows[0];
  }
}

module.exports = UsuarioModel;