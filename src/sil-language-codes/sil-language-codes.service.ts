import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilLanguageCodesService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>>> {
    const res = await this.httpService
      .get('https://www.ethnologue.com/sites/default/files/LanguageCodes.tab')
      .toPromise();

    const lines = res.data.split('\n');
    // id	printName	invertedName
    lines.map(async (line) => {
      const [langID, countryId, langStatus, name] = line.split('\t');

      const query1 = `SELECT id FROM sil_language_codes WHERE code='${langID}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
          UPDATE sil_language_codes SET country_code = $1, status = $2, name = $3 where code=$4
        `,
            values: [countryId, langStatus, name, langID],
          })
          .then(() => {
            console.log('update success');
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        await this.pg.pool
          .query({
            text: `
              INSERT INTO sil_language_codes (code, country_code, status, name)
              VALUES ($1, $2, $3, $4)
              `,
            values: [langID, countryId, langStatus, name],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //   const query = `
      //   INSERT INTO sil_language_codes (code, country_code, status, name)
      //   VALUES ('${langID}', '${countryId}', '${langStatus}', '${name})
      //   ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET country_code = '${countryId}', status='${langStatus}', name='${name}' where code='${langID}'
      // `;
    });
    return null;
  }
}
