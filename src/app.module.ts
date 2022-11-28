import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { SilIso6393Service } from './sil-iso6393/sil-iso6393.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresService } from './postgres/postgres.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron/cron.service';
import { SilIso6393NameService } from './sil-iso6393-name/sil-iso6393-name.service';
import { SilIso6393MacrolanguagesService } from './sil-iso6393-macrolanguages/sil-iso6393-macrolanguages.service';
import { SilIso6393RetirementsService } from './sil-iso6393-retirements/sil-iso6393-retirements.service';
import { SilCountryCodesService } from './sil-country-codes/sil-country-codes.service';
import { SilLanguageCodesService } from './sil-language-codes/sil-language-codes.service';
import { SilLanguageIndexService } from './sil-language-index/sil-language-index.service';
import { UfCountriesListService } from './uf-countries-list/uf-countries-list.service';
import { UfLangNamesService } from './uf-lang-names/uf-lang-names.service';
import { UfLanguagesService } from './uf-languages/uf-languages.service';
import { UfAdditionalLanguagesService } from './uf-additional-languages/uf-additional-languages.service';
import { Iso6392Service } from './iso6392/iso6392.service';
import { DataLoaderController } from './data-loader/data-loader.controller';
import { Iso6392Controller } from './iso6392/iso6392.controller';
import { SilCountryCodesController } from './sil-country-codes/sil-country-codes.controller';
import { SilIso6393MacrolanguagesController } from './sil-iso6393-macrolanguages/sil-iso6393-macrolanguages.controller';
import { SilIso6393NameController } from './sil-iso6393-name/sil-iso6393-name.controller';
import { SilIso6393RetirementsController } from './sil-iso6393-retirements/sil-iso6393-retirements.controller';
import { SilLanguageCodesController } from './sil-language-codes/sil-language-codes.controller';
import { SilLanguageIndexController } from './sil-language-index/sil-language-index.controller';
import { SilIso6393Controller } from './sil-iso6393/sil-iso6393.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    DataLoaderController,
    Iso6392Controller,
    SilCountryCodesController,
    SilIso6393MacrolanguagesController,
    SilIso6393NameController,
    SilIso6393RetirementsController,
    SilLanguageCodesController,
    SilLanguageIndexController,
    SilIso6393Controller,
  ],
  providers: [
    AppService,
    SilIso6393Service,
    PostgresService,
    CronService,
    SilIso6393NameService,
    SilIso6393MacrolanguagesService,
    SilIso6393RetirementsService,
    SilCountryCodesService,
    SilLanguageCodesService,
    SilLanguageIndexService,
    UfCountriesListService,
    UfLangNamesService,
    UfLanguagesService,
    UfAdditionalLanguagesService,
    Iso6392Service,
  ],
})
export class AppModule {
  constructor(private readonly config: ConfigService) {}
}
