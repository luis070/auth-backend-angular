import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import { CreateUserDto ,LoginDto,UpdateAuthDto,RegisterUserDto} from './dto';

import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadL } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
     private userModel: Model<User>,
     private jwtService: JwtService,
    ){}

  async create(createAuthDto: CreateUserDto):Promise<User> {
    // console.log(createAuthDto);
    // // return 'This action adds a new auth';
    // const newUser = new this.userModel(createAuthDto);

    // return newUser.save();

    try{
      // const newUser= new this.userModel(CreateUserDto);
      // return await newUser.save();
      // -----------------------
      // esta parte encripta la contraseña del usuario
      const {password, ...userData} = createAuthDto

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password,10),
        ...userData
      });
      await newUser.save();
      // esta parte oculta la contraseña al momento de enviar el codigo por eso movemos el user para regresar 
      const {password:_, ...user}= newUser.toJSON();

      return user;      
    }
    catch(error){
      if ( error.code === 11000){
        throw new BadRequestException(`${createAuthDto.email} already exist`);
      }
      throw new InternalServerErrorException('Hay error al momento de guardar');
    }
  }


  async register(registerDto:RegisterUserDto):Promise<LoginResponse> {
// este caso es para cando se cuenta con datos de mas y se tiene que especificar lo que se quiere enviar
    // const user = await this.create({email: registerDto.email, name: registerDto.name, password: registerDto.password})
    const userRegister = await this.create(registerDto); 

    return {
      user: userRegister,
      token:this.getJwtoken({id:userRegister._id})

    }

  }


  async login(loginDto:LoginDto):Promise<LoginResponse> {
    // console.log({loginDto});
    const {email, password} = loginDto;

    const user = await this.userModel.findOne({email});
    if(!user){
      throw new UnauthorizedException('not valid credentials - emails');
    }
    if(!bcryptjs.compareSync(password,user.password)){
      throw new UnauthorizedException('contraseña no es valida');
    }

    const { password:_ ,  ...rest} = user.toJSON();

    return {
      user: rest,
      // ...rest,
      token: this.getJwtoken({id: user.id })
      // token:'ABC-123'
    }

  }
  

  
  findAll():Promise<User[]> {
    // return `This action returns all auth`;
    return this.userModel.find();
  }

  async findUserId(id : string){
    const user = await this.userModel.findById(id);
    const {password, ...rest } = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  getJwtoken( payload : JwtPayloadL){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
