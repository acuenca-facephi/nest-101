import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/status (GET status)', (done) => {
        const result = request(app.getHttpServer())
            .get('/status');
        result.expect(200);
        result.end((err, res) => {
            expect(err).toBeNull();
            expect(res.text).toBeDefined();
            done();
        });
    });
});
