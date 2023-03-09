import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const config = new DocumentBuilder()
    .setTitle('Data load API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalGuards(new AuthGuard());

  await app.listen(process.env.PORT || 80);
}
bootstrap();
