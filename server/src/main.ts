import { NestFactory } from '@nestjs/core';
import { CustomExceptionFilter } from './0-base/http-exception-filter';
import { FirebaseSetting } from './0-base/initialize-firebaes';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const firebaseSetting = app.get(FirebaseSetting);
  firebaseSetting.init();

  app.useGlobalFilters(new CustomExceptionFilter());

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);
  console.log(`listen port: ${port}`);
}
bootstrap();