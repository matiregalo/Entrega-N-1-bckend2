import UserDAO from "../dao/user.dao.js";
import UserDto from "../dto/user.dto.js";

const userDAO = new UserDAO();

export const getUsers = async (req, res) => {
  try {
    const users = await userDAO.getUsers();
    const usersDto = UserDto.fromArray(users);
    res.send({ status: "success", payload: usersDto });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const createUsers = async (req, res) => {
  try {
    const newUser = await userDAO.createUser(req.body);
    const userDto = UserDto.from(newUser);
    res.status(201).send({ status: "success", payload: userDto });
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .send({ status: "error", message: "Email ya registrado" });
    }
    res.status(400).send({ status: "error", message: error.message });
  }
};