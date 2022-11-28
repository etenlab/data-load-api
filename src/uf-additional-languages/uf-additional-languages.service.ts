import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
// import { AxiosResponse } from 'axios';
// import { Observable } from 'rxjs';

@Injectable()
export class UfAdditionalLanguagesService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}
}
