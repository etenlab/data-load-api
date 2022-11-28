import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilIso6393RetirementsService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>>> {
    const res = await this.httpService
      .get(
        'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Retirements.tab',
      )
      .toPromise();

    const lines = res.data.split('\n');
    // id refName	retReason	changeTo	retRemedy	effective
    lines.map(async (line) => {
      const [id, refName, retReason, changeTo, retRemedy, effective] =
        line.split('\t');

      const query1 = `SELECT id FROM iso_639_3_retirements WHERE iso_639_3='${id}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
          UPDATE iso_639_3_retirements SET ref_name = $1, ret_reason = $2, change_to = $3, ret_remedy = $4, effective = $5 where iso_639_3=$6
        `,
            values: [refName, retReason, changeTo, retRemedy, effective, id],
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
              INSERT INTO iso_639_3_retirements (iso_639_3, ref_name, ret_reason, change_to, ret_remedy, effective)
              VALUES ($1, $2, $3, $4, $5, $6)
              `,
            values: [id, refName, retReason, changeTo, retRemedy, effective],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //   const query = `
      //     INSERT INTO iso_639_3_retirements (iso_639_3, part_2b, part_2t, part_1, scope, entry_type, ref_name, comment)
      //     VALUES ('${id}', '${refName}', '${retReason}', '${changeTo}', '${retRemedy}', '${effective}')
      //     ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET part_2b = '${refName}', part_2t='${retReason}', part_1='${changeTo}',
      //     scope='${retRemedy}', entry_type='${effective}' where iso_639_3='${id}'
      //   `;
    });
    return null;
  }
}
