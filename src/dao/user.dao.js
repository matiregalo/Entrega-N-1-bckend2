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

  async getByEmail(email) {
    try {
      const normalizedEmail = String(email).toLowerCase().trim();
      const user = await userModel.findOne({ email: normalizedEmail }).lean();
      return user || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  async updateResetToken(userId, resetToken, resetTokenExpires) {
    try {
      const user = await userModel
        .findByIdAndUpdate(
          userId,
          { resetToken, resetTokenExpires },
          { new: true },
        )
        .lean();
      return user || null;
    } catch (error) {
      throw new Error(
        `Error al actualizar token de recuperación: ${error.message}`,
      );
    }
  }

  async updatePassword(userId, newPassword) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return null;
      }
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();
      return user.toObject();
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  async getByResetToken(token) {
    try {
      const user = await userModel
        .findOne({
          resetToken: token,
          resetTokenExpires: { $gt: new Date() },
        })
        .lean();
      return user || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario por token: ${error.message}`);
    }
  }
}
