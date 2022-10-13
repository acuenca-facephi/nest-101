import { Test, TestingModule } from '@nestjs/testing';
import { SchemaRegistryService } from './schema-registry.service';

describe('SchemaRegistryService', () => {
  let service: SchemaRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaRegistryService],
    }).compile();

    service = module.get<SchemaRegistryService>(SchemaRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
