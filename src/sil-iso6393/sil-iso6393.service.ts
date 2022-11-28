import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilIso6393Service {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>>> {
    const res = await this.httpService
      .get(
        'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab',
      )
      .toPromise();

    const lines = res.data.split('\n');
    lines.map(async (line) => {
      const [id, part2b, part2t, part1, scope, languageType, refName, comment] =
        line.split('\t');

      const query1 = `SELECT id FROM iso_639_3 WHERE iso_639_3='${id}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
            UPDATE iso_639_3 SET part_2b=$1, part_2t=$2, part_1=$3, scope=$4::iso_639_3_scope_type, entry_type=$5, ref_name=$6, 
            comment=$7 where iso_639_3=$8
          `,
            values: [
              part2b,
              part2t,
              part1,
              scope,
              languageType,
              refName,
              comment,
              id,
            ],
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
                INSERT INTO iso_639_3 (iso_639_3, part_2b, part_2t, part_1, scope, entry_type, ref_name, comment)
                VALUES ($1, $2, $3, $4, $5::iso_639_3_scope_type, $6, $7, $8)
                `,
            values: [
              id,
              part2b,
              part2t,
              part1,
              scope,
              languageType,
              refName,
              comment,
            ],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //   const query = `
      //     INSERT INTO iso_639_3 (iso_639_3, part_2b, part_2t, part_1, scope, entry_type, ref_name, comment)
      //     VALUES ('${id}', '${part2b}', '${part2t}', '${part1}', '${scope}', '${languageType}', '${refName}', '${comment}')
      //     ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET part_2b = '${part2b}', part_2t='${part2t}', part_1='${part1}',
      //     scope='${scope}', entry_type='${languageType}', ref_name='${refName}', comment='${comment}' where iso_639_3='${id}'
      //   `;

      return;
    });
    return null;
  }
}
