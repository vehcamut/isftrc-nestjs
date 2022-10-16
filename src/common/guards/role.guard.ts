import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.matchRoles(roles, user.roles);
  }

  matchRoles(rolesf: string[], roless: string[]): boolean {
    console.log(rolesf);
    console.log(roless);
    console.log(roless.some((e: string): boolean => rolesf?.includes(e)));
    return roless.some((e: string): boolean => rolesf?.includes(e));
    //return rolesf.every((e: string): boolean => roless?.includes(e));
  }
}
