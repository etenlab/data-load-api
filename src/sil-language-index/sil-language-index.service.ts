import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilLanguageIndexService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>>> {
    const res = await this.httpService
      .get('https://www.ethnologue.com/sites/default/files/LanguageIndex.tab')
      .toPromise();

    const lines = res.data.split('\n');
    // id	printName	invertedName
    lines.map(async (line) => {
      const [langId, countryId, nameType, name] = line.split('\t');

      const query1 = `SELECT id FROM sil_language_index WHERE language_code='${langId}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
          UPDATE sil_language_index SET country_code=$1, name_type=$2, name=$3 where language_code=$4
        `,
            values: [countryId, nameType, name, langId],
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
              INSERT INTO sil_language_index (language_code, country_code, name_type, name)
              VALUES ($1, $2, $3, $4)
              `,
            values: [langId, countryId, nameType, name],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //   const query = `
      //     INSERT INTO sil_language_index (language_code, country_code, name_type, name)
      //     VALUES ('${langId}', '${countryId}', '${nameType}', '${name})
      //     ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET country_code = '${countryId}', name_type='${nameType}',
      //      name='${name}' where language_code='${langId}'
      //   `;
    });
    return null;
  }
}
