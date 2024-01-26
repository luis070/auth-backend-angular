import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadL } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authservice: AuthService,

  ){}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();    
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('no hay token');
    }
    // console.log({request});
    // console.log({token});
    // return Promise.resolve(true);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadL>(
        token,
        {
          secret: process.env.JWT_SEED
        }
      );

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
    const user = await this.authservice.findUserId(payload.id);
    if(!user) throw new UnauthorizedException('user does no exist');    
    if(!user.isActive) throw new UnauthorizedException('usuario no esta activo');
    // console.log({payload});
    // request['user'] = payload;
    request['user'] = user

    return Promise.resolve(true);
    } catch {
      throw new UnauthorizedException();
    }



  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
