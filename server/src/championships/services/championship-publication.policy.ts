import { Injectable, BadRequestException } from '@nestjs/common';
import { Championship } from '../entities/championship.entity';

@Injectable()
export class ChampionshipPublicationPolicy {
  
  validateForPublication(championship: Championship): void {
    const errors: string[] = [];

    if (!championship.name || championship.name.trim().length === 0) {
      errors.push('O campeonato deve ter um nome.');
    }

    if (!championship.startDate || !championship.endDate) {
      errors.push('As datas de início e término são obrigatórias.');
    } else if (new Date(championship.startDate) > new Date(championship.endDate)) {
      errors.push('A data de início deve ser anterior à data de término.');
    }

    if (!championship.modalities || championship.modalities.length === 0) {
      errors.push('É necessário cadastrar pelo menos uma modalidade para publicar.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'O campeonato não atende aos critérios para publicação.',
        errors
      });
    }
  }
}
