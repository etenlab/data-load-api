import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

import fetch from 'node-fetch';
import { load } from 'cheerio';
// import { query } from 'express';

interface Iso6392Data {
  code6392: string;
  code6391: string;
  englishName: string;
  frenchName: string;
  germanName: string;
}

@Injectable()
export class Iso6392Service {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>>> {
    const url = 'https://www.loc.gov/standards/iso639-2/php/code_list.php';

    const response = await fetch(url);
    const body = await response.text();

    const $ = load(body);
    const pages = $('table').find('table').find('tr');
    const iso6392Data: Iso6392Data[] = [];

    pages.each((_i, tr) => {
      const tds = $(tr).find('td');
      if (tds.length && $(tds[0]).text().length < 8) {
        iso6392Data.push({
          code6392: $(tds[0]).text(),
          code6391: $(tds[1]).text(),
          englishName: $(tds[2]).text(),
          frenchName: $(tds[3]).text(),
          germanName: $(tds[4]).text(),
        });
      }
    });

    if (iso6392Data.length) {
      iso6392Data.forEach(async (item) => {
        const query1 = `SELECT id FROM iso_639_2 WHERE iso_639_2='${item.code6392}'`;
        const res1 = await this.pg.pool.query(query1, []);
        if (res1.rows.length) {
          await this.pg.pool
            .query({
              text: `
            UPDATE iso_639_2 SET iso_639_1 = $1, english_name=$2, french_name=$3,
            german_name=$4 where iso_639_2.iso_639_2=$5
          `,
              values: [
                item.code6391,
                item.englishName,
                item.frenchName,
                item.germanName,
                item.code6392,
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
                INSERT INTO iso_639_2 (iso_639_2.iso_639_2, iso_639_1, english_name, french_name, german_name)
                VALUES ($1, $2, $3, $4, $5)
                `,
              values: [
                item.code6392,
                item.code6391,
                item.englishName,
                item.frenchName,
                item.germanName,
              ],
            })
            .then(() => {
              console.log('insert success');
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    }
    return null;
  }
}
