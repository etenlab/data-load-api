import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { entities } from './entities';
import { StrongsService } from './strongs/strongs.service';
import { StrongsController } from './strongs/strongs.controller';
import { ScriptureService } from './scripture/scripture.service';
import { ScriptureController } from './scripture/scripture.controller';
import { GraphService } from './graph/graph.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
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
    StrongsController,
    ScriptureController,
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
    StrongsService,
    ScriptureService,
    GraphService,
  ],
})
export class AppModule {
  constructor(private readonly config: ConfigService) {}
}
