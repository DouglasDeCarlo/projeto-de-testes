import {User} from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { senhasConferem, validarEmail, validarIdade } from "../validators/UserValidators.js";

export default class UserController {
  static async LoginUser(req,res){
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    try{
      const query = User.findOne({email});
      const user = await (typeof query?.select === "function"
        ? query.select("+password +role")
        : query);

      if(!user){
        return res.status(404).json({message:"Usuario nao encontrado no DB"})
      }

      const pass = await bcrypt.compare(password, user.password);

      if (!pass){
        return res.status(401).json({message:"Senha incorreta!"})
      }

      const token = jwt.sign({userId: user._id, role: user.role || "user"}, process.env.JWT_SECRET,{ expiresIn:"1h" })

      return res.status(200).json({token})
    }catch(error){
      console.error("Erro ao fazer login:", error)
      return res.status(500).json({error:"Error interno do servidor"})
    }
  }

  static async RegisterUser(req,res) {
    const {name,password,confirmPassword} = req.body;
    const age = req.body.age;
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!senhasConferem(password, confirmPassword)){
      return res.status(400).json({message:"As senhas são diferentes!"})
    }
    if(!validarEmail(email)){
      return res.status(400).json({message:"Email inválido!"})
    }
    if(!validarIdade(age)){
      return res.status(400).json({message:"Idade inválida!"})
    }

    try{
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({message:"Este e-mail já está cadastrado!"});
      }

      const cryptPassword = await bcrypt.hash(password,12);

      const newUser = new User({
        name: typeof name === "string" ? name.trim() : "",
        age,
        email,
        password: cryptPassword,
        role: "user",
      });

      const createUser = await newUser.save()

      return res.status(200).json({
        message:"Usuario criado com sucesso!",
        data: {
          _id: createUser._id,
          name: createUser.name,
          age: createUser.age,
          email: createUser.email,
          role: createUser.role,
        },
      });

    }catch(error){
      console.error("Error ao registrar usuario", error);
      return res.status(500).json({error:"Erro interno do servidor"})
    }
  }

  static async authenticateToken(req,res,next) {
    const authHeader = req.headers["authorization"];

    if(typeof authHeader !== "string"){
      return res.status(401).json({message:"Sem token nao é permitido"})
    }

    const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    if (!match) {
      return res.status(401).json({message:"Formato de token inválido"});
    }

    jwt.verify(match[1], process.env.JWT_SECRET, (err, user)=>{
      if (err){
        return res.status(403).json({message: "Token Inválido"});
      }
      req.user = user;
      next();
    })
  }
}