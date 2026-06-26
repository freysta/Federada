import { Test, TestingModule } from '@nestjs/testing';
import { ChampionshipStateMachine } from './championship-state-machine.service';
import { ChampionshipPublicationPolicy } from './championship-publication.policy';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Championship, ChampionshipStatus } from '../entities/championship.entity';
import { BadRequestException } from '@nestjs/common';

describe('ChampionshipStateMachine', () => {
  let service: ChampionshipStateMachine;
  let policy: ChampionshipPublicationPolicy;
  let mockRepo: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockRepo = {
      save: jest.fn().mockImplementation(champ => Promise.resolve(champ)),
    };
    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionshipStateMachine,
        ChampionshipPublicationPolicy,
        {
          provide: getRepositoryToken(Championship),
          useValue: mockRepo,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        }
      ],
    }).compile();

    service = module.get<ChampionshipStateMachine>(ChampionshipStateMachine);
    policy = module.get<ChampionshipPublicationPolicy>(ChampionshipPublicationPolicy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transition()', () => {
    it('should be idempotent if target state is the same', async () => {
      const champ = new Championship();
      champ.status = ChampionshipStatus.OPEN;
      
      const result = await service.transition(champ, ChampionshipStatus.OPEN, { userId: '1' });
      
      expect(result.status).toBe(ChampionshipStatus.OPEN);
      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid transitions', async () => {
      const champ = new Championship();
      champ.status = ChampionshipStatus.DRAFT;
      
      await expect(service.transition(champ, ChampionshipStatus.FINISHED, { userId: '1' }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should transition from DRAFT to PUBLISHED successfully', async () => {
      const champ = new Championship();
      champ.status = ChampionshipStatus.DRAFT;
      champ.name = 'Valid Name';
      champ.startDate = new Date('2030-01-01');
      champ.endDate = new Date('2030-01-10');
      champ.modalities = [{} as any]; // Mock modality
      
      // Spy on policy
      jest.spyOn(policy, 'validateForPublication').mockImplementation(() => {});

      const result = await service.transition(champ, ChampionshipStatus.PUBLISHED, { userId: '1' });
      
      expect(result.status).toBe(ChampionshipStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
      expect(policy.validateForPublication).toHaveBeenCalledWith(champ);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('championship.published', champ);
    });
  });

  describe('canTransition()', () => {
    it('allows DRAFT -> PUBLISHED', () => {
      expect(service.canTransition(ChampionshipStatus.DRAFT, ChampionshipStatus.PUBLISHED)).toBe(true);
    });
    
    it('blocks DRAFT -> FINISHED', () => {
      expect(service.canTransition(ChampionshipStatus.DRAFT, ChampionshipStatus.FINISHED)).toBe(false);
    });

    it('allows PUBLISHED -> OPEN', () => {
      expect(service.canTransition(ChampionshipStatus.PUBLISHED, ChampionshipStatus.OPEN)).toBe(true);
    });
  });
});
