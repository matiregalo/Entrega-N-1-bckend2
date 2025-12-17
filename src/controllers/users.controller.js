import UserDAO from "../dao/user.dao.js";

const  userDAO = new UserDAO();

export const getUsers = async (req, res) => {
    const users = await userDAO.getUsers();
    res.send({status: 'success', result: users})
}

export const createUsers = async (req, res) => {
    const newUser = await userDAO.createUser(req.body);
    res.status(201).send({status: 'success', result: newUser})
}