/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
// import { SilIso6393Service } from 'src/sil-iso6393/sil-iso6393.service';
// import { UfCountriesListService } from 'src/uf-countries-list/uf-countries-list.service';
import { Cron } from '@nestjs/schedule';

import { Iso6392Service } from '../iso6392/iso6392.service';
import { SilCountryCodesService } from '../sil-country-codes/sil-country-codes.service';
import { SilIso6393Service } from '../sil-iso6393/sil-iso6393.service';
import { SilIso6393MacrolanguagesService } from '../sil-iso6393-macrolanguages/sil-iso6393-macrolanguages.service';
import { SilIso6393NameService } from '../sil-iso6393-name/sil-iso6393-name.service';
import { SilIso6393RetirementsService } from '../sil-iso6393-retirements/sil-iso6393-retirements.service';
import { SilLanguageCodesService } from '../sil-language-codes/sil-language-codes.service';
import { SilLanguageIndexService } from '../sil-language-index/sil-language-index.service';

@Injectable()
export class CronService {
  constructor(
    private iso6393: SilIso6393Service,
    private silCountryCode: SilCountryCodesService,
    private iso6392: Iso6392Service,
    private silIso6393Macrolang: SilIso6393MacrolanguagesService,
    private silIso6393Name: SilIso6393NameService,
    private silIso6393Retirement: SilIso6393RetirementsService,
    private silLanguageCode: SilLanguageCodesService,
    private silLanguageIndex: SilLanguageIndexService,
  ) {
    console.log('SilIso6393Service');
  }

  @Cron('0 0 * * 0')
  async handleCron() {
    // this.logger.debug('Called when the current second is 45');
    // const { createHmac } = await import('node:crypto');
    // const util = require('util')
    console.log('cron started');
    // const test = await this.iso6393.fetchData();
    await this.iso6393.fetchData();
    await this.silCountryCode.fetchData();
    await this.iso6392.fetchData();
    await this.silIso6393Macrolang.fetchData();
    await this.silIso6393Name.fetchData();
    await this.silIso6393Retirement.fetchData();
    await this.silLanguageCode.fetchData();
    await this.silLanguageIndex.fetchData();
    // console.log(test);
  }
}
