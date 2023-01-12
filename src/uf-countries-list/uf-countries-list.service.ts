import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

// import fetch from 'node-fetch';
// import { load } from 'cheerio';

//import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';

@Injectable()
export class UfCountriesListService {
  constructor(
    private pg: PostgresService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchData(): Promise<Observable<AxiosResponse<any>> | null> {
    const url = 'http://td.unfoldingword.org/uw/countries/';

    // const response = await fetch(url);
    // const body = await response.text();

    // const $ = load(body);

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
      ignoreHTTPSErrors: true,

      // add this
      executablePath: executablePath(),
    });
    const page = await browser.newPage();

    // const pages = $('li[class=paginate_button]');
    await page.goto(url);
    const resultsSelector = 'li.paginate_button ';
    await page.waitForSelector(resultsSelector);

    // title.each()
    const links = await page.evaluate((resultsSelector) => {
      return [...document.querySelectorAll(resultsSelector)].map((anchor) => {
        console.log(anchor);
        // const title = anchor.textContent.split('|')[0].trim();
        // return `${title} - ${anchor.className}`;
      });
    }, resultsSelector);
    console.log(links);
    return null;
  }
}
