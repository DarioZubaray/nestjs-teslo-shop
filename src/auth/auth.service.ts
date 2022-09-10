import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user);

      // delete user.password;
      // return user;
      return {
        ...user,
        password: undefined
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true }
      });

      if (!user) throw new UnauthorizedException('Credentials are not valid.');

      if ( !bcrypt.compareSync(password, user.password) ) throw new UnauthorizedException('Credentials are invalid.');

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Ocurrió un error un error inesperado');
  }

}
