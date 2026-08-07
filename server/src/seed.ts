import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './orders/entities/user.entity';
import { Championship, ChampionshipStatus, AudienceFocus } from './championships/entities/championship.entity';
import { Modality } from './championships/entities/modality.entity';
import { Subscription, SubscriptionStatus } from './championships/entities/subscription.entity';
import { Team } from './teams/entities/team.entity';
import { AthleteProfile } from './teams/entities/athlete-profile.entity';
import { AthleteChampionshipDocument } from './championships/entities/athlete-championship-document.entity';
import { Match } from './championships/entities/match.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const champRepo = app.get<Repository<Championship>>(getRepositoryToken(Championship));
  const modRepo = app.get<Repository<Modality>>(getRepositoryToken(Modality));
  const subRepo = app.get<Repository<Subscription>>(getRepositoryToken(Subscription));
  const teamRepo = app.get<Repository<Team>>(getRepositoryToken(Team));
  const athleteRepo = app.get<Repository<AthleteProfile>>(getRepositoryToken(AthleteProfile));
  const docRepo = app.get<Repository<AthleteChampionshipDocument>>(getRepositoryToken(AthleteChampionshipDocument));
  const matchRepo = app.get<Repository<Match>>(getRepositoryToken(Match));

  console.log('🌱 Iniciando Seed Completo para Testes de Campeonato...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. USUÁRIOS CHAVE
  async function findOrCreateUser(name: string, email: string, role: 'ADMIN' | 'SPORTS_ADMIN' | 'ATHLETE') {
    let u = await userRepository.findOne({ where: { email } });
    if (!u) {
      u = userRepository.create({
        name,
        email,
        password: passwordHash,
        role,
        emailVerified: true,
        isActive: true,
      });
      await userRepository.save(u);
    }
    return u;
  }

  const admin = await findOrCreateUser('Super Admin', 'admin@federada.com', 'ADMIN');
  const org = await findOrCreateUser('Organizador Principal', 'organizador@federada.com', 'SPORTS_ADMIN');
  console.log('✅ Usuários Admin/Organizador criados.');

  // 2. CAMPEONATO DE TESTE COMPLETO
  let champ = await champRepo.findOne({
    where: { name: 'Copa Universitária Federada 2026' },
    relations: ['owner'],
  });

  if (!champ) {
    const newChamp = champRepo.create({
      name: 'Copa Universitária Federada 2026',
      description: 'O maior campeonato universitário de esportes do estado. Futsal, Vôlei e Xadrez com transmissão e premiação oficial.',
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-25'),
      enrollmentDeadline: new Date('2026-08-09'),
      documentsDeadline: new Date('2026-08-09'),
      status: ChampionshipStatus.ONGOING,
      organizer: 'Liga Universitária IFRO',
      audienceFocus: AudienceFocus.UNIVERSITY,
      owner: org,
      settings: {
        requireRg: true,
        requireEnrollment: true,
        customDocuments: ['Atestado Médico'],
        locations: ['Ginásio Principal IFRO', 'Quadra Poliesportiva Central', 'Auditório de Jogos']
      }
    });
    champ = await champRepo.save(newChamp);
  }
  console.log('✅ Campeonato "Copa Universitária Federada 2026" pronto.');

  const targetChamp = champ;

  // 3. MODALIDADES
  async function findOrCreateModality(name: string, type: 'INDIVIDUAL' | 'COLETIVO', gender: 'MASCULINO' | 'FEMININO' | 'MISTO', price: number, minAth: number, maxAth: number, maxSpots: number) {
    let mod = await modRepo.findOne({ where: { name, championship: { id: targetChamp.id } } });
    if (!mod) {
      mod = modRepo.create({
        name,
        type,
        gender,
        price,
        minAthletes: minAth,
        maxAthletes: maxAth,
        minAge: 16,
        maxAge: 40,
        maxSpots,
        championship: targetChamp
      });
      await modRepo.save(mod);
    }
    return mod;
  }

  const futsalMod = await findOrCreateModality('Futsal Masculino Série A', 'COLETIVO', 'MASCULINO', 50.00, 5, 12, 8);
  const voleiMod = await findOrCreateModality('Vôlei Feminino', 'COLETIVO', 'FEMININO', 40.00, 6, 12, 8);
  const xadrezMod = await findOrCreateModality('Xadrez Individual Open', 'INDIVIDUAL', 'MISTO', 15.00, 1, 1, 16);
  console.log('✅ Modalidades Futsal, Vôlei e Xadrez prontas.');

  // 4. EQUIPES & ATLETAS
  const teamsData = [
    { name: 'Atlética ADS Lions', uni: 'IFRO Ji-Paraná', code: 'LIONS' },
    { name: 'Atlética Engenharia Tubarões', uni: 'UNIR', code: 'TUBA' },
    { name: 'Atlética Medicina Panteras', uni: 'FAP', code: 'PANTERAS' },
    { name: 'Atlética Direito Spartanos', uni: 'ULBRA', code: 'SPARTA' },
  ];

  const createdTeams: Team[] = [];
  const createdAthletes: AthleteProfile[] = [];

  for (let i = 0; i < teamsData.length; i++) {
    const tData = teamsData[i];
    let team = await teamRepo.findOne({ where: { name: tData.name } });
    if (!team) {
      const presUser = await findOrCreateUser(`Presidente ${tData.code}`, `presidente.${tData.code.toLowerCase()}@federada.com`, 'ATHLETE');
      team = teamRepo.create({
        name: tData.name,
        university: tData.uni,
        inviteCode: `FED-${tData.code}-2026`,
        owner: presUser
      });
      await teamRepo.save(team);
    }
    createdTeams.push(team);

    // Criar 3 atletas por equipe
    for (let a = 1; a <= 3; a++) {
      const athUser = await findOrCreateUser(`Atleta ${tData.code} ${a}`, `atleta.${tData.code.toLowerCase()}${a}@federada.com`, 'ATHLETE');
      let profile = await athleteRepo.findOne({ where: { user: { id: athUser.id } } });
      if (!profile) {
        profile = athleteRepo.create({
          user: athUser,
          team,
          cpf: `123.456.78${i}${a}-00`,
          teamRole: a === 1 ? 'CAPTAIN' : 'MEMBER'
        });
        await athleteRepo.save(profile);
      }
      createdAthletes.push(profile);
    }
  }

  console.log(`✅ ${createdTeams.length} Equipes e ${createdAthletes.length} Atletas prontos.`);

  // 5. INSCRIÇÕES DAS EQUIPES NO FUTSAL & VÔLEI
  for (let i = 0; i < createdTeams.length; i++) {
    const team = createdTeams[i];
    
    // Futsal Subscriptions
    let subFutsal = await subRepo.findOne({ where: { team: { id: team.id }, modality: { id: futsalMod.id } } });
    if (!subFutsal) {
      subFutsal = subRepo.create({
        modality: futsalMod,
        team,
        status: SubscriptionStatus.CONFIRMED,
        paymentStatus: i % 2 === 0 ? 'PAID' : 'PENDING'
      });
      await subRepo.save(subFutsal);
    }

    // Vôlei Subscriptions
    let subVolei = await subRepo.findOne({ where: { team: { id: team.id }, modality: { id: voleiMod.id } } });
    if (!subVolei) {
      subVolei = subRepo.create({
        modality: voleiMod,
        team,
        status: i === 0 ? SubscriptionStatus.CONFIRMED : SubscriptionStatus.PENDING_DOCS,
        paymentStatus: 'PAID'
      });
      await subRepo.save(subVolei);
    }
  }
  console.log('✅ Inscrições de equipes criadas.');

  // 6. DOCUMENTOS DOS ATLETAS
  for (let i = 0; i < createdAthletes.length; i++) {
    const ath = createdAthletes[i];
    let doc = await docRepo.findOne({ where: { athlete: { id: ath.id }, championship: { id: targetChamp.id } } });
    if (!doc) {
      const isPending = i % 3 === 0;
      const isApproved = i % 3 === 1;
      
      doc = docRepo.create({
        athlete: ath,
        championship: targetChamp,
        rgUrl: '/uploads/sample-rg.jpg',
        rgStatus: isPending ? 'PENDING' : isApproved ? 'APPROVED' : 'REJECTED',
        rgRejectionReason: !isPending && !isApproved ? 'Foto do RG ilegível' : null,
        enrollmentUrl: '/uploads/sample-matricula.pdf',
        enrollmentStatus: isApproved ? 'APPROVED' : 'PENDING',
        enrollmentRejectionReason: null
      });
      await docRepo.save(doc);
    }
  }
  console.log('✅ Registros de Documentos dos Atletas criados para validação.');

  // 7. PARTIDAS DE FUTSAL
  let match1 = await matchRepo.findOne({ where: { modality: { id: futsalMod.id }, round: 1, bracketPosition: 1 } });
  if (!match1) {
    match1 = matchRepo.create({
      modality: futsalMod,
      teamA: createdTeams[0], // ADS Lions
      teamB: createdTeams[1], // Tubarões
      scoreA: 3,
      scoreB: 1,
      status: 'FINISHED',
      location: 'Ginásio Principal IFRO',
      date: new Date('2026-08-11T14:00:00Z'),
      round: 1,
      bracketPosition: 1
    });
    await matchRepo.save(match1);
  }

  let match2 = await matchRepo.findOne({ where: { modality: { id: futsalMod.id }, round: 1, bracketPosition: 2 } });
  if (!match2) {
    match2 = matchRepo.create({
      modality: futsalMod,
      teamA: createdTeams[2], // Panteras
      teamB: createdTeams[3], // Spartanos
      scoreA: 0,
      scoreB: 0,
      status: 'SCHEDULED',
      location: 'Quadra Poliesportiva Central',
      date: new Date('2026-08-12T16:00:00Z'),
      round: 1,
      bracketPosition: 2
    });
    await matchRepo.save(match2);
  }

  console.log('✅ Partidas de teste criadas.');
  console.log('\n======================================================');
  console.log('🎉 SEED COMPLETO EXECUTADO COM SUCESSO!');
  console.log('🏆 Campeonato: "Copa Universitária Federada 2026"');
  console.log('🔑 Credenciais para Teste Completo:');
  console.log('   - Organizador/Admin: organizador@federada.com / 123456');
  console.log('   - Super Admin: admin@federada.com / 123456');
  console.log('   - Presidente (ADS Lions): presidente.lions@federada.com / 123456');
  console.log('   - Atleta (ADS Lions): atleta.lions1@federada.com / 123456');
  console.log('======================================================\n');

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Erro no Seed:', err);
  process.exit(1);
});
