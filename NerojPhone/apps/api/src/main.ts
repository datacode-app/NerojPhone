import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Enable CORS for frontend
    app.enableCors({
        origin: '*', // Configure this for your frontend URL in production
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });
    await app.listen(4000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
