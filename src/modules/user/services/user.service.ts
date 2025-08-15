import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/port/create-user.dto';
import { UpdateUserDto } from '../dto/port/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return createUserDto;
  }

  findAll() {
    return [];
  }

  findOne(id: number) {
    return id;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return { id, updateUserDto };
  }

  remove(id: number) {
    return id;
  }
}
