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

  private instagramCache: any = null;
  private instagramCacheTime: number = 0;

  async getInstagramFeed() {
    const CACHE_TTL = 3600 * 1000; // 1 hour

    if (this.instagramCache && (Date.now() - this.instagramCacheTime < CACHE_TTL)) {
      return this.instagramCache;
    }

    const token = process.env.INSTAGRAM_TOKEN;
    if (!token) {
      console.warn('INSTAGRAM_TOKEN not found in env');
      return [];
    }

    try {
      const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${token}`);
      const data = await response.json();

      if (data.error) {
        console.error('Instagram API Error:', data.error);
        return this.instagramCache || [];
      }

      // Format data
      const feed = (data.data || [])
        .filter((item: any) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
        .slice(0, 12) // Get last 12 items
        .map((item: any) => ({
          id: item.id,
          url: item.media_url,
          title: item.caption ? item.caption.split('\n')[0] : 'POST INSTAGRAM',
          permalink: item.permalink,
          timestamp: item.timestamp,
        }));

      this.instagramCache = feed;
      this.instagramCacheTime = Date.now();

      return feed;
    } catch (error) {
      console.error('Failed to fetch Instagram feed:', error);
      return this.instagramCache || [];
    }
  }
}
