import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class SilIso6393NameService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>> | null> {
    const res = await this.httpService
      .get(
        'https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Name_Index.tab',
      )
      .toPromise();

    const lines = res!.data.split('\n');
    // id	printName	invertedName
    lines.map(async (line: any) => {
      const [id, printName, invertedName] = line.split('\t');

      const query1 = `SELECT id FROM iso_639_3_names WHERE iso_639_3='${id}'`;
      const res1 = await this.pg.pool.query(query1, []);
      if (res1.rows.length) {
        await this.pg.pool
          .query({
            text: `
          UPDATE iso_639_3_names SET print_name = $1, inverted_name=$2 where iso_639_3=$3
        `,
            values: [printName, invertedName, id],
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
              INSERT INTO iso_639_3_names (iso_639_3, print_name, inverted_name)
              VALUES ($1, $2, $3)
              `,
            values: [id, printName, invertedName],
          })
          .then(() => {
            console.log('insert success');
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //   const query = `
      //   INSERT INTO iso_639_3_names (iso_639_3, print_name, inverted_name)
      //   VALUES ('${id}', '${printName}', '${invertedName}')
      //   ON CONFLICT ON CONSTRAINT iso_639_3_unique DO UPDATE SET print_name = '${printName}', inverted_name='${invertedName}' where iso_639_3='${id}'
      // `;
    });
    return null;
  }
}
