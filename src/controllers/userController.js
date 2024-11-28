const UserDAO = require("../models/DAO/userDAO");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const axios = require('axios');
const userDAO = require("../models/DAO/userDAO");
const FormData = require("form-data")

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
  
      const order = await UserDAO.getUserOrder(id)
  
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
  
  async updateUserImage(req, reply) {
    console.log("Iniciando troca de foto de usuario");
    
    try {
        const userId = Number(req.params.id);
        
        // Use Fastify's multipart handling
        const data = await req.file();
        
        if (!userId || isNaN(userId)) {
            return reply.status(400).send({ message: "ID do usuário é obrigatório e deve ser um número válido." });
        }

        if (!data) {
            return reply.status(400).send({ message: "Nova imagem é obrigatória." });
        }

        const currentUser = await UserDAO.getUserById(userId);
        if (!currentUser) {
            return reply.status(404).send({ message: "Usuário não encontrado." });
        }

        // Create a FormData instance for axios
        const formData = new FormData();
        formData.append('image', data.file, {
            filename: data.filename,
            contentType: data.mimetype
        });

        const response = await axios.post("http://localhost:3535/assets/upload", formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log(response.data)
        console.log("URL:", response.data.url);
        const imageUrl = response.data.url;

        await UserDAO.updateUserPhoto(userId, imageUrl);

        return reply.status(200).send({ message: "Imagem atualizada com sucesso!", url: imageUrl });
    } catch (error) {
        console.error("Erro detalhado ao fazer upload da imagem:", error);
        
        return reply.status(500).send({ 
            message: "Erro ao atualizar a imagem do usuário.", 
            error: error.message 
        });
    }
}


  async updateName(req, reply) {
    console.log("recebido")
  try {
      const userId = Number(req.params.id);
      const { newName } = req.body;
      
      const currentUser = await UserDAO.getUserById(userId);
      if (!currentUser) {
          return reply.status(404).send({ message: "User not found" });
      }

      const userData = {
          ...req.body,
          name: await bcrypt.hash(newName, 10)
      };


      const updatedUser = await UserDAO.updateUserName(userId, userData);

      reply.send(updatedUser);
      
  } catch (err) {
      console.error(err);
      reply.status(500).send({ error: "Internal Server Error" });
  }
}



async updateRole(req, reply) {
  console.log("recebido");
  try {
    const userId = Number(req.params.id);
    const { newRole } = req.body;

    if (!newRole) {
      return reply.status(400).send({ message: "Role is required" });
    }

    const currentUser = await UserDAO.getUserById(userId);
    if (!currentUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    const updatedUser = await UserDAO.updateUserRole(userId, { role: newRole });

    reply.send(updatedUser);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
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
  console.log("creating user")
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

    const verificationLink = `http://localhost:3000/verify/${newUser.id}`

    const emailBody = {
      to: email,
      subject: "Fanta.club Account Confirmation",
      text: `Welcome to Fanta.club!\n\nPlease click on the link below to verify your account:\n${verificationLink}\n\nIf you did not sign up, please ignore this message.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f08c00; border-radius: 5px;">
          <div style="background-color: #f08c00; color: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
            Welcome to Fanta.club!
          </div>
          <div style="padding: 20px; font-size: 16px; color: #333;">
            <p>Hello!</p>
            <p>Thank you for joining Fanta.club! To complete your registration, please verify your account by clicking the button below:</p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="${verificationLink}" style="color: #fff; background-color: #f08c00; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Your Account</a>
            </p>
            <p>If you did not sign up for this account, you can safely ignore this email.</p>
          </div>
          <div style="background-color: #f08c00; color: #fff; padding: 10px; text-align: center; font-size: 14px;">
            &copy; ${new Date().getFullYear()} Fanta.club. All rights reserved.
          </div>
        </div>
      `
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

async verifyUser(req, reply) {
  try {
      const userId = Number(req.params.id);

      if (!userId || isNaN(userId)) {
          return reply.status(400).send({ message: "Invalid user id" });
      }

      const user = await UserDAO.getUserById(userId);
      if (!user) {
          return reply.status(404).send({ message: 'User not found' });
      }

      if (user.verified) {
          return reply.status(400).send({ message: "Already verified user" });
      }

      const updateUser = await UserDAO.updateUser(userId, { verified: true });
      
      if (updateUser.verified === true) {
          // Prepara e envia o email de verificação bem-sucedida
          const emailBody = {
              to: user.email,
              subject: "Welcome to Fanta.club - Account Verified!",
              text: `Congratulations! Your Fanta.club account has been successfully verified. You now have full access to all features.`,
              html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f08c00; border-radius: 5px;">
                      <div style="background-color: #f08c00; color: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
                          Account Verified Successfully!
                      </div>
                      <div style="padding: 20px; font-size: 16px; color: #333;">
                          <p>Hello!</p>
                          <p>Great news! Your Fanta.club account has been successfully verified. 🎉</p>
                          <p>You now have full access to all features of our platform, including:</p>
                          <ul>
                              <li>Complete access to all platform features</li>
                              <li>Ability to make purchases</li>
                              <li>Access to exclusive content</li>
                          </ul>
                          <p style="text-align: center; margin: 20px 0;">
                              <a href="http://localhost:3000" 
                                 style="color: #fff; background-color: #f08c00; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                  Start Exploring
                              </a>
                          </p>
                          <p>Thank you for joining our community!</p>
                      </div>
                      <div style="background-color: #f08c00; color: #fff; padding: 10px; text-align: center; font-size: 14px;">
                          &copy; ${new Date().getFullYear()} Fanta.club. All rights reserved.
                      </div>
                  </div>
              `
          };

          try {
              await axios.post('http://localhost:3535/send/email', emailBody);
          } catch (emailError) {
              console.error("Error sending verification success email:", emailError);
          }

          reply.send({
              message: "User verified successfully",
              user: updateUser
          });
      }

  } catch (error) {
      console.error("error verifying user", error);
      reply.status(500).send({ error: "internal server error" });
  }
}

async updateUser(req, reply) {
  console.log("recebido")
  try {
      const userId = Number(req.params.id);
      const { currentPassword, newPassword } = req.body;
      
      const currentUser = await UserDAO.getUserById(userId);
      if (!currentUser) {
          return reply.status(404).send({ message: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isPasswordValid) {
          return reply.status(401).send({ message: "Current password is incorrect" });
      }

      const userData = {
          ...req.body,
          password: await bcrypt.hash(newPassword, 10)
      };

      delete userData.currentPassword;
      delete userData.newPassword;

      const updatedUser = await UserDAO.updateUser(userId, userData);

      // Prepara e envia o email de notificação
      const emailBody = {
          to: currentUser.email,
          subject: "Fanta.club Security Alert",
          text: `Your Fanta.club account password has been changed. If you didn't make this change, please contact us immediately.`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f08c00; border-radius: 5px;">
                  <div style="background-color: #f08c00; color: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
                      Fanta.club Security Alert
                  </div>
                  <div style="padding: 20px; font-size: 16px; color: #333;">
                      <p>Hello!</p>
                      <p>This email confirms that your Fanta.club account password has been successfully changed.</p>
                      <p style="background-color: #fff3e0; padding: 15px; border-radius: 5px; border: 1px solid #ffe0b2;">
                          <strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.
                      </p>
                      <p>For your security, we recommend:</p>
                      <ul>
                          <li>Regularly updating your password</li>
                          <li>Not sharing your login credentials</li>
                          <li>Using a unique password for your Fanta.club account</li>
                      </ul>
                  </div>
                  <div style="background-color: #f08c00; color: #fff; padding: 10px; text-align: center; font-size: 14px;">
                      &copy; ${new Date().getFullYear()} Fanta.club. All rights reserved.
                  </div>
              </div>
          `
      };

      try {
          await axios.post('http://localhost:3535/send/email', emailBody);
      } catch (emailError) {
          console.error("Error sending credential change email:", emailError);
      }

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

  async findUserByName(req, reply) {
    try{
      const {userName} = req.query;
      if (!userName) {
        reply.status(400).send({ error: 'Nome do usuário é obrigatório.' });
        return;
      }
      const findedUserByNmae = await userDAO.getUserByName(userName);
      reply.status(200).send(findedUserByNmae);
      
    } catch (err){
      throw new Error(`Unxpected error, we can't search the user, try later, check the error: ${err}`);
    };
  };

  async findUserByRole(req, reply) {
    try{
      const {userRole} = req.query;
      if(!userRole){
        reply.status(400).send({server:"You need to insert the user role!"});
      };
      const findeduserRole = await userDAO.getUserByRole(userRole);
      reply.status(200).send(findeduserRole);
    }catch (err){
      throw new Error(`Unxpected error, we can't search the user, try later, check the erro: ${err}`);
    };
  };

};



module.exports = new userController();