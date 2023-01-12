import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilIso6393MacrolanguagesService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>> | null> {
    const res = await this.httpService
      .get(
        'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3-macrolanguages.tab',
      )
      .toPromise();

    const lines = res!.data.split('\n');
    // mId	iId	iStatus
    lines.map(async (line: any, index: any) => {
      // if (index > 0) {
      const [mId, iId, iStatus] = line
        .replace(/(\r\n|\n|\r)/gm, '')
        .split('\t');
      if (index > 0) {
        const query1 = `SELECT id FROM iso_639_3_macrolanguages WHERE i_id='${iId}'`;
        const res1 = await this.pg.pool.query(query1, []);
        if (res1.rows.length) {
          await this.pg.pool
            .query({
              text: `
          UPDATE iso_639_3_macrolanguages SET m_id = $1, i_status = '${iStatus}' where i_id = $2
        `,
              values: [mId, iId],
            })
            .then(() => {
              console.log('update success');
            })
            .catch((err) => {
              //   console.log(`
              //   UPDATE iso_639_3_macrolanguages SET m_id = '${mId}', i_status = '${iStatus}' where i_id = '${iId}'
              // `);
              console.log('update error AAA');
              console.log(err.message);
            });
        } else {
          await this.pg.pool
            .query({
              text: `
              INSERT INTO iso_639_3_macrolanguages (m_id, i_id, i_status)
              VALUES ($1, $2, $3::iso_639_3_status_type)
              `,
              values: [mId, iId, iStatus],
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
        //   INSERT INTO iso_639_3_macrolanguages (m_id, i_id, i_status)
        //   VALUES ('${mId}', '${iId}', '${iStatus}')
        //   ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET i_id = '${iId}', i_status='${iStatus}' where m_id='${mId}'
        // `;
      }
    });
    return null;
  }
}
