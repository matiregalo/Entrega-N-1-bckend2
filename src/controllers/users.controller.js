import UserDAO from "../dao/user.dao.js";
import UserDto from "../dto/user.dto.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const userDAO = new UserDAO();
const { JWT_SECRET, JWT_EXPIRES = "15m", COOKIE_NAME } = process.env;
const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send({
        status: "error",
        message: "No autenticado",
      });
    }

    const user = await userDAO.getById(req.user.id);
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    const userDto = UserDto.from(user);
    res.send({ status: "success", payload: userDto });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || age == null || !email || !password) {
      return res.status(400).send({
        status: "error",
        message:
          "Faltan campos requeridos: first_name, last_name, age, email, password",
      });
    }
    const newUser = await userDAO.create({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    const userDto = UserDto.from(newUser);
    res.status(201).send({ status: "success", payload: userDto });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .send({ status: "error", message: "Email ya registrado" });
    }
    if (
      error.message.includes("validación") ||
      error.message.includes("obligatorio")
    ) {
      return res.status(400).send({ status: "error", message: error.message });
    }
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) {
      return res.status(401).send({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const token = signAccessToken({
      sub: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      role: user.role,
    });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.send({
      status: "success",
      message: "Sesión iniciada correctamente",
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.send({
    status: "success",
    message: "Sesión cerrada correctamente",
  });
};

// Mostrar formulario HTML para restablecer contraseña
export const showResetPasswordForm = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - Recuperación de contraseña</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <div class="error">
              <p>Token no proporcionado. Por favor, usa el enlace del email.</p>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Verificar que el token sea válido
    const user = await userDAO.getByResetToken(token);

    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Token inválido - Recuperación de contraseña</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Token inválido o expirado</h1>
            <div class="error">
              <p>Este enlace de recuperación ya no es válido o ha expirado. Por favor, solicita uno nuevo.</p>
            </div>
          </div>
        </body>
        </html>
      `);
    }

    // Mostrar formulario
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recuperar contraseña - Ecommerce Backend2</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 450px;
            width: 100%;
          }
          h1 { 
            color: #333; 
            margin-bottom: 10px;
            font-size: 28px;
          }
          .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .form-group { 
            margin-bottom: 20px; 
          }
          label { 
            display: block; 
            margin-bottom: 8px; 
            color: #333;
            font-weight: 500;
            font-size: 14px;
          }
          input[type="password"] { 
            width: 100%; 
            padding: 12px 15px; 
            border: 2px solid #e0e0e0; 
            border-radius: 8px; 
            font-size: 16px;
            transition: border-color 0.3s;
          }
          input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
          }
          .btn { 
            width: 100%; 
            padding: 14px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
          }
          .btn:active {
            transform: translateY(0);
          }
          .error-message {
            background: #ffebee;
            color: #d32f2f;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: none;
          }
          .success-message {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: none;
          }
          .info {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Recuperar contraseña</h1>
          <p class="subtitle">Ingresa tu nueva contraseña</p>
          
          <div id="errorMessage" class="error-message"></div>
          <div id="successMessage" class="success-message"></div>
          
          <form id="resetForm" onsubmit="handleSubmit(event)">
            <div class="form-group">
              <label for="newPassword">Nueva contraseña</label>
              <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                required 
                minlength="6"
                placeholder="Mínimo 6 caracteres"
              >
              <p class="info">La nueva contraseña debe ser diferente a la actual</p>
            </div>
            
            <input type="hidden" id="token" value="${token}">
            
            <button type="submit" class="btn">Cambiar contraseña</button>
          </form>
        </div>

        <script>
          async function handleSubmit(event) {
            event.preventDefault();
            
            const token = document.getElementById('token').value;
            const newPassword = document.getElementById('newPassword').value;
            const errorDiv = document.getElementById('errorMessage');
            const successDiv = document.getElementById('successMessage');
            const form = document.getElementById('resetForm');
            
            // Ocultar mensajes anteriores
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            try {
              const response = await fetch('/api/users/resetPassword', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                successDiv.textContent = '✅ ' + data.message;
                successDiv.style.display = 'block';
                form.style.display = 'none';
              } else {
                errorDiv.textContent = '❌ ' + data.message;
                errorDiv.style.display = 'block';
              }
            } catch (error) {
              errorDiv.textContent = '❌ Error de conexión. Por favor, intenta nuevamente.';
              errorDiv.style.display = 'block';
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Recuperación de contraseña</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Error</h1>
          <div class="error">
            <p>Ocurrió un error inesperado. Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).send({
        status: "error",
        message: 'Los campos "token" y "newPassword" son requeridos',
      });
    }

    // Buscar usuario por token (solo si no ha expirado)
    const user = await userDAO.getByResetToken(token);

    if (!user) {
      return res.status(400).send({
        status: "error",
        message: "Token inválido o expirado",
      });
    }

    // Obtener el usuario completo desde la BD (necesitamos el documento para comparar)
    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Comparar la nueva contraseña con la contraseña actual
    const isSamePassword = await bcrypt.compare(newPassword, userDoc.password);

    if (isSamePassword) {
      return res.status(400).send({
        status: "error",
        message: "La nueva contraseña debe ser diferente a la contraseña actual",
      });
    }

    // Actualizar la contraseña (el método updatePassword ya maneja el hash)
    await userDAO.updatePassword(user._id, newPassword);

    return res.json({
      status: "success",
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
};
