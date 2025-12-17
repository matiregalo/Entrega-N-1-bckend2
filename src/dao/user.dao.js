import userModel from "../models/user.model.js";

export default class UserDAO {
  async getById(id) {
    try {
      const user = await userModel.findById(id).lean();
      return user || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  async create(userData) {
    try {
      if (userData.email) {
        userData.email = String(userData.email).toLowerCase().trim();
      }
      const newUser = await userModel.create(userData);
      return newUser.toObject();
    } catch (error) {
      if (error.name === "ValidationError") {
        throw new Error(`Error de validación: ${error.message}`);
      }
      throw error;
    }
  }
}
