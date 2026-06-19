import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { News } from './entities/news.entity';
import { Event } from './entities/event.entity';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(TeamMember) private teamRepo: Repository<TeamMember>,
    @InjectRepository(News) private newsRepo: Repository<News>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  getTeam() {
    return this.teamRepo.find({ order: { createdAt: 'ASC' } });
  }

  createTeamMember(data: any) {
    const member = this.teamRepo.create(data);
    return this.teamRepo.save(member);
  }

  async updateTeamMember(id: string, data: any) {
    await this.teamRepo.update(id, data);
    return this.teamRepo.findOne({ where: { id } });
  }

  deleteTeamMember(id: string) {
    return this.teamRepo.delete(id);
  }

  getNews() {
    return this.newsRepo.find({ order: { createdAt: 'DESC' } });
  }

  createNews(data: any) {
    const news = this.newsRepo.create(data);
    return this.newsRepo.save(news);
  }

  async updateNews(id: string, data: any) {
    await this.newsRepo.update(id, data);
    return this.newsRepo.findOne({ where: { id } });
  }

  deleteNews(id: string) {
    return this.newsRepo.delete(id);
  }

  getEvents() {
    return this.eventRepo.find({ order: { version: 'ASC' } });
  }

  createEvent(data: any) {
    const event = this.eventRepo.create(data);
    return this.eventRepo.save(event);
  }

  async updateEvent(id: string, data: any) {
    await this.eventRepo.update(id, data);
    return this.eventRepo.findOne({ where: { id } });
  }

  deleteEvent(id: string) {
    return this.eventRepo.delete(id);
  }
}
