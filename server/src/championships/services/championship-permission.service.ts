import { Injectable, ForbiddenException } from '@nestjs/common';
import { Championship } from '../entities/championship.entity';

@Injectable()
export class ChampionshipPermissionService {
  
  canManage(championship: Championship, user: any): boolean {
    if (!user) return false;
    
    // Super admin can manage everything
    if (user.role === 'ADMIN') return true;
    
    // Sports admin can only manage their own championships
    if (user.role === 'SPORTS_ADMIN') {
      return championship.owner?.id === user.userId;
    }
    
    return false;
  }

  assertCanManage(championship: Championship, user: any): void {
    if (!this.canManage(championship, user)) {
      throw new ForbiddenException('Você não tem permissão para gerenciar este campeonato.');
    }
  }

  buildFindOptionsForUser(user: any): any {
    if (user.role === 'ADMIN') {
      return {}; // No filter, return all
    }
    if (user.role === 'SPORTS_ADMIN') {
      return { owner: { id: user.userId } };
    }
    return { status: 'OPEN' }; // Generic fallback for public users (though they shouldn't hit admin routes)
  }
}
