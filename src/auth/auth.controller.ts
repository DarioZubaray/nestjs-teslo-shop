import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    createUser(@Body() createAuthDto: CreateUserDto) {
        return this.authService.create(createAuthDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Get('check-auth-status')
    @Auth()
    checkAuthStatus(
        @GetUser() user: User
    ) {
        console.log({user})
        return this.authService.ceckAuthStatus( user );
    }

    @Get('private')
    @UseGuards(AuthGuard())
    testingPrivateRoute(
        //@Req() request: Express.Request,
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
        @RawHeaders() rawHeaders: string[],
        @Headers() headers: IncomingHttpHeaders
    ) {
        console.log(userEmail);

        return {
            ok: true,
            userEmail,
            user,
            message: 'this route is private',
            rawHeaders,
            headers
        }
    }

    @Get('private-role')
    //@SetMetadata('roles', ['admin', 'super-user'])
    @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
    @UseGuards(AuthGuard(), UserRoleGuard)
    testingPrivateRouteWithRoles(
        @GetUser() user: User
    ) {
        return {
            ok: true,
            user
        }
    }

    @Get('private-composition')
    @Auth(ValidRoles.admin, ValidRoles.superUser)
    testingPrivateRouteWithCompositionDecorator(
        @GetUser() user: User
    ) {
        return {
            ok: true,
            user
        }
    }

}
