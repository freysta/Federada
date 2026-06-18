import { Controller, Get, Param, Put, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { ChangePasswordDto, UpdateUserDto } from './dto/auth.dto';
import { Request } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.authService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/promote')
  promoteToAdmin(@Param('id') id: string) {
    return this.authService.promoteToAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin-create')
  createAdmin(@Body() registerDto: any) {
    return this.authService.createAdminUser(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateProfile(@Request() req: any, @Body() updateDto: UpdateUserDto) {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  updateUserByAdmin(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.authService.updateUserByAdmin(id, updateDto);
  }
}
