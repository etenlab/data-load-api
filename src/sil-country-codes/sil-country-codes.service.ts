import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilCountryCodesService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>> | null> {
    const res = await this.httpService
      .get('https://www.ethnologue.com/sites/default/files/CountryCodes.tab')
      .toPromise();

    const lines = res!.data.split('\n');
    // id	printName	invertedName
    lines.map(async (line: any) => {
      const [countryId, name, area] = line.split('\t');
      const query1 = `SELECT id FROM sil_country_codes WHERE code='${countryId}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
          UPDATE sil_country_codes SET name = $1, area=$2 where code=$3
        `,
            values: [name, area, countryId],
          })
          .then(() => {
            console.log('update success');
          })
          .catch((err) => {
            console.log('update error');
            console.log(err);
          });
      } else {
        console.log(countryId + '||' + name + '||' + area);
        await this.pg.pool
          .query({
            text: `
              INSERT INTO sil_country_codes (code, name, area)
              VALUES ($1, $2, $3)
              `,
            values: [countryId, name, area],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log('insert error');
            console.log(err);
          });
      }
      //   const query = `
      //   INSERT INTO sil_country_codes (code, name, area)
      //   VALUES ('${countryId}', '${name}', '${area}')
      //   ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET name = '${name}', area='${area}' where code='${countryId}'
      // `;
    });
    return null;
  }
}
