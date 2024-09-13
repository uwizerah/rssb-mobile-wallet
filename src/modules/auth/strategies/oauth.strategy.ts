import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
      tokenURL: 'https://accounts.google.com/o/oauth2/token',
      clientID: configService.get<string>('OAUTH_CLIENT_ID'),
      clientSecret: configService.get<string>('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get<string>('OAUTH_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = { accessToken, profile };
    return user;
  }
}
