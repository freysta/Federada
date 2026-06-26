import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship, ChampionshipStatus } from '../entities/championship.entity';
import { ChampionshipPublicationPolicy } from './championship-publication.policy';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChampionshipStateMachine {
  constructor(
    @InjectRepository(Championship)
    private championshipRepository: Repository<Championship>,
    private publicationPolicy: ChampionshipPublicationPolicy,
    private eventEmitter: EventEmitter2
  ) {}

  async transition(championship: Championship, targetState: ChampionshipStatus, user: any): Promise<Championship> {
    // Idempotency check
    if (championship.status === targetState) {
      return championship;
    }

    // Validate transition
    if (!this.canTransition(championship.status, targetState)) {
      throw new BadRequestException(`Transição inválida de ${championship.status} para ${targetState}`);
    }

    // State-specific validations
    if (targetState === ChampionshipStatus.PUBLISHED) {
      this.publicationPolicy.validateForPublication(championship);
    }

    // Apply state and timestamps
    championship.status = targetState;
    const now = new Date();
    
    switch (targetState) {
      case ChampionshipStatus.PUBLISHED:
        championship.publishedAt = now;
        break;
      case ChampionshipStatus.OPEN:
        championship.registrationOpenedAt = now;
        break;
      case ChampionshipStatus.CLOSED:
        championship.registrationClosedAt = now;
        break;
      case ChampionshipStatus.ONGOING:
        championship.startedAt = now;
        break;
      case ChampionshipStatus.FINISHED:
        championship.finishedAt = now;
        break;
      case ChampionshipStatus.ARCHIVED:
        championship.archivedAt = now;
        break;
    }

    const saved = await this.championshipRepository.save(championship);
    
    // Domain Events
    this.eventEmitter.emit(`championship.${targetState.toLowerCase()}`, saved);

    return saved;
  }

  canTransition(fromState: ChampionshipStatus, toState: ChampionshipStatus): boolean {
    const validTransitions: Record<ChampionshipStatus, ChampionshipStatus[]> = {
      [ChampionshipStatus.DRAFT]: [ChampionshipStatus.PUBLISHED],
      [ChampionshipStatus.PUBLISHED]: [ChampionshipStatus.OPEN, ChampionshipStatus.DRAFT],
      [ChampionshipStatus.OPEN]: [ChampionshipStatus.CLOSED],
      [ChampionshipStatus.CLOSED]: [ChampionshipStatus.GENERATING_BRACKET, ChampionshipStatus.OPEN],
      [ChampionshipStatus.GENERATING_BRACKET]: [ChampionshipStatus.ONGOING, ChampionshipStatus.CLOSED],
      [ChampionshipStatus.ONGOING]: [ChampionshipStatus.FINISHED],
      [ChampionshipStatus.FINISHED]: [ChampionshipStatus.ARCHIVED],
      [ChampionshipStatus.ARCHIVED]: [],
    };

    const allowed = validTransitions[fromState] || [];
    return allowed.includes(toState);
  }

  getAllowedActions(championship: Championship, userRole: string, isOwner: boolean): string[] {
    const actions: string[] = [];
    
    // Simple RBAC + Status logic
    if (userRole === 'ADMIN' || (userRole === 'SPORTS_ADMIN' && isOwner)) {
      actions.push('edit_settings');
      
      if (championship.status === ChampionshipStatus.DRAFT) {
        actions.push('publish');
        actions.push('manage_modalities');
      }
      if (championship.status === ChampionshipStatus.PUBLISHED) {
        actions.push('open_registration');
        actions.push('revert_to_draft');
      }
      if (championship.status === ChampionshipStatus.OPEN) {
        actions.push('close_registration');
        actions.push('manage_subscriptions');
      }
      if (championship.status === ChampionshipStatus.CLOSED) {
        actions.push('reopen_registration');
        actions.push('generate_brackets');
        actions.push('manage_subscriptions');
      }
      if (championship.status === ChampionshipStatus.GENERATING_BRACKET) {
        actions.push('start_championship');
      }
      if (championship.status === ChampionshipStatus.ONGOING) {
        actions.push('manage_matches');
        actions.push('finish_championship');
      }
    }

    // Public actions
    if (championship.status === ChampionshipStatus.OPEN) {
      actions.push('subscribe');
    }

    return actions;
  }
}
