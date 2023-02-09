import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const basicAuthCredentials = process.env.BASIC_AUTH_CREDENTIALS;

const allowedPaths = ['/', '/api', '/info'];

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    if (!basicAuthCredentials) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;

    if (allowedPaths.includes(request.path)) {
      return true;
    }

    if (headers.authorization?.split(' ')[0] !== 'Basic') {
      return false;
    }

    const auth = Buffer.from(
      headers.authorization?.split(' ')[1] || '',
      'base64',
    ).toString();

    if (!auth) {
      return false;
    }

    const [adminUsername, adminPassword] = basicAuthCredentials.split(':');
    const [username, password] = auth.split(':');

    if (username !== adminUsername || password !== adminPassword) {
      return false;
    }

    return true;
  }
}
