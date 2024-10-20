const UserDAO = require("../models/DAO/userDAO");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const userDAO = require("../models/DAO/userDAO");

class userController {

  async login(req, reply) {
    console.log("Requisição recebida:", req.body);
    const { email, password } = req.body;  // Alterado de 'pass' para 'password'
  
    try {
      // Verifica se o usuário existe
      const user = await UserDAO.getUserByEmail(email);
      console.log("Usuário encontrado:", user);
  
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
  
      // Verifica se a senha está correta
      if (!user.password) {
        console.error("Hash de senha não encontrado para o usuário");
        return reply.status(500).send({ message: 'Internal server error' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);  // Alterado de 'pass' para 'password'
      console.log("Senha válida:", isPasswordValid);
  
      if (!isPasswordValid) {
        return reply.status(401).send({ message: 'Invalid credentials' });
      }
  
      // Gera o token JWT
      const token = await reply.jwtSign({ id: user.id, email: user.email });
  
      reply.send({ token });
    } catch (error) {
      console.error("Erro durante o login:", error);
      reply.status(500).send({ message: 'Failed to login' });
    }
  }
  

  async getUserOrder(req, reply) {
    console.log("Get user Order init")
    try {
      const id = Number(req.params.id);
      console.log(id)
  
      const order = await userDAO.getUserOrder(id)
  
      if (!order) {
        return reply.status(404).send({ message: "Usuario não tem nenhuma compra" })
      }
  
      if (!id) {
        console.log('usuario não logado')
      }
  
      const orderWithExpiration = order.map(item => {
        let expirationDate = new Date(item.createdAt);
        
        switch (item.expiration) {
          case 'DAY':
            expirationDate.setDate(expirationDate.getDate() + 1);
            break;
          case 'WEEK':
            expirationDate.setDate(expirationDate.getDate() + 7);
            break;
          case 'MONTH':
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            break;
          case 'LIFETIME':
            expirationDate.setFullYear(expirationDate = '2038');
            break;
          default:
            console.log(`Tipo de expiração não reconhecido: ${item.expiration}`);
        }
  
        return {
          ...item,
          expirationDate: item.expiration === 'LIFETIME' ? 'Nunca expira' : expirationDate.toISOString()
        };
      });
  
      console.log(orderWithExpiration)
      
      reply.send(orderWithExpiration)
    } catch(err) {
      console.log(err)
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
  
  async getLoggedUser(req, reply) {
    console.log("get looged user")
    try {
      const authHeader = req.headers.authorization;
      console.log(authHeader)
      const token = authHeader.split(' ')[1];
      console.log(token)

      if (!token) {
        return reply.status(401).send({ message: 'No token provided' });
      }
      console.log("executando decode.");
      console.log(process.env.JWT_SECRET)

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await UserDAO.getUserById(decoded.id);
  
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
  
      const { password, ...userWithoutPassword } = user;
  
      console.log(userWithoutPassword)
      reply.send(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao obter usuário logado:", error);
  
      if (error.name === 'JsonWebTokenError') {
        return reply.status(401).send({ message: 'Invalid token' });
      } else {
        return reply.status(500).send({ message: 'Internal server error' });
      }
    }
  }
  

  async getLoggedUserById(req, reply) {
    const usuarioLogado = await UserDAO.getUserById(req.user.id);
    reply.send(usuarioLogado);
  }

  async getAllUsers(req, reply) {
    try {
      const users = await UserDAO.getAllUsers();
      reply.send(users);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: "Failed to retrieve users" });
    }
  }

  async getUserById(req, reply) {
    try {
      const userId = Number(req.params.id);
      const user = await UserDAO.getUserById(userId);

      if (user) {
        reply.send(user);
      } else {
        reply.status(404).send({ message: "User not found" });
      }
    } catch (err) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }

  async createUser(req, reply) {
    try {
      const { password, ...userData } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await UserDAO.createUser({ ...userData, password: hashedPassword });
  
      reply.status(201).send(newUser);
    } catch (err) {
      if (err.message === 'Email already exists') {
        reply.status(409).send({ error: 'Email already exists' });
      } else {
        console.error(err);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  }

  async updateUser(req, reply) {
    try {
      const userId = Number(req.params.id);
      const userData = req.body;

      if (userData.pass) {
        userData.pass = await bcrypt.hash(userData.pass, 10);
      }

      const updatedUser = await UserDAO.updateUser(userId, userData);
      if (updatedUser) {
        reply.send(updatedUser);
      } else {
        reply.status(404).send({ message: "User not found" });
      }
    } catch (err) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }

  async deleteUser(req, reply) {
    try {
      const userId = Number(req.params.id);
      await UserDAO.deleteUser(userId);
      reply.status(204).send();
    } catch (err) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}



module.exports = new userController();