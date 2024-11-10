const UserDAO = require("../models/DAO/userDAO");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const axios = require('axios')

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
    const { email, name, password, ...userData } = req.body;

    // Verifica se o email já está em uso
    const existingUserByEmail = await UserDAO.getUserByEmail(email);
    if (existingUserByEmail) {
      return reply.status(409).send({ error: 'Email already in use' });
    }

    // Verifica se o nome de usuário já está em uso
    const existingUserByUsername = await UserDAO.getUserByUsername(name);
    if (existingUserByUsername) {
      return reply.status(409).send({ error: 'Username already in use' });
    }

    // Cria o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário
    const newUser = await UserDAO.createUser({ ...userData, email, name, password: hashedPassword, verified: false });

    const verificationLink = `http://localhost:3535/users/verify/${newUser.id}`

    const emailBody ={
      to: email,
      subject: "Fanta.club account confirmation ",
      text: `Welcome to fanta.club!\n\nPlease Clic on the link below to verify your account:\n${verificationLink}\n\nIf you gay dont click`
    };

    try {
      await axios.post('http://localhost:3535/send/email', emailBody);
    } catch (emailError){
      console.error("error sending verificatuon email", emailError)
    }

    reply.status(201).send(newUser);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

  async verifyUser(req, reply){
    try {
      const userId = Number(req.params.id)

      if(!userId || isNaN(userId)){
        return reply.status(400).send({message: "Invalid user id"})
      }

      const user = await UserDAO.getUserById(userId);
      console.log(user)
      if(!user){
        return reply.status(404).send({message: 'User not found'})
      }

      if(user.verified){
        return reply.status(400).send({message: "Already verified user"})
      }

      const updateUser = await UserDAO.updateUser(userId, {verified: true})
      console.log(updateUser)
      if(user.verified == true){
        reply.send({
          message: "User verified sucessfully",
          user: updateUser
        })
      }

    } catch (error) {
      console.error("error verifying user", error)
      reply.status(500).send({error: "internal server error"})
      
    }
  }

  async updateUser(req, reply) {
    console.log("recebido")
    try {
        const userId = Number(req.params.id);
        const { currentPassword, newPassword } = req.body;
        
        // Primeiro, buscar o usuário para verificar a senha atual
        const currentUser = await UserDAO.getUserById(userId);
        if (!currentUser) {
            return reply.status(404).send({ message: "User not found" });
        }

        // Verificar se a senha atual está correta
        const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password); // Changed from currentUser.pass
        if (!isPasswordValid) {
            return reply.status(401).send({ message: "Current password is incorrect" });
        }

        // Preparar os dados para atualização
        const userData = {
            ...req.body,
            password: await bcrypt.hash(newPassword, 10) // Changed from pass to password
        };

        // Remover as propriedades que não devem ser salvas no banco
        delete userData.currentPassword;
        delete userData.newPassword;

        const updatedUser = await UserDAO.updateUser(userId, userData);
        reply.send(updatedUser);
        
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: "Internal Server Error" });
    }
  }

  async toggleUserStatus(req, reply) {
    try {
      const userId = Number(req.params.id);
      
      // Verifica se o ID é um numero valido
      if (!userId || isNaN(userId)) {
        return reply.status(400).send({ message: 'Invalid user ID' });
      }
  
      // Busca o usuário atual para verificar seu status
      const currentUser = await UserDAO.getUserById(userId);
      
      if (!currentUser) {
        return reply.status(404).send({ message: 'User not found' });
      }
  
      // Define o novo status (inverte o valor atual)
      const newStatus = !currentUser.isActive;
  
      // Atualiza o status do usuário
      const updatedUser = await UserDAO.updateUser(userId, { isActive: newStatus });
  
      reply.send({
        message: `User status successfully changed to ${newStatus ? 'active' : 'inactive'}`,
        user: updatedUser
      });
  
    } catch (err) {
      console.error('Error toggling user status:', err);
      reply.status(500).send({ error: 'Internal Server Error' });
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