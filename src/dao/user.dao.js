import userModel from "../models/user.model.js";

export default class UserDAO {
  async getAll() {
    try {
      const users = await userModel.find().lean();
      return users;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const user = await userModel.findById(id).lean();
      return user || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const normalizedEmail = String(email).toLowerCase().trim();
      const user = await userModel.findOne({ email: normalizedEmail }).lean();
      return user || null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      // Normalizar email antes de crear
      if (userData.email) {
        userData.email = String(userData.email).toLowerCase().trim();
      }
      const newUser = await userModel.create(userData);
      return newUser.toObject();
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw error; // Re-lanzar para que el servicio maneje códigos específicos (11000)
    }
  }

  async update(id, data) {
    try {
      // Normalizar email si se está actualizando
      if (data.email) {
        data.email = String(data.email).toLowerCase().trim();
      }
      const updatedUser = await userModel
        .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
        .lean();

      if (!updatedUser) {
        return null;
      }
      return updatedUser;
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await userModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}