import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaIngestService } from './kafka-ingest.service';

describe('KafkaIngestService', () => {
  let service: KafkaIngestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaIngestService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('localhost:9092') },
        },
      ],
    }).compile();

    service = module.get(KafkaIngestService);
  });

  it('consumes topic and returns stub result', async () => {
    const result = await service.consumeTopic('lims.events');

    expect(result.topic).toBe('lims.events');
    expect(result.messagesConsumed).toBeGreaterThan(0);
    expect(result.status).toBe('stub');
  });

  it('respects maxMessages cap', async () => {
    const result = await service.consumeTopic('billing.events', 50);

    expect(result.messagesConsumed).toBeLessThanOrEqual(50);
  });
});
