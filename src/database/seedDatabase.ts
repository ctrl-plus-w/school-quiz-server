import bcrypt from 'bcrypt';

import { QuestionSpecification } from '../models/questionSpecification';
import { VerificationType } from '../models/verificationType';
import { Group } from '../models/group';
import { Role } from '../models/role';
import { User } from '../models/user';

export default async (): Promise<void> => {
  await Role.bulkCreate([
    {
      slug: 'admin',
      name: 'Admin',
      permission: 1,
    },
    {
      slug: 'professeur',
      name: 'Professeur',
      permission: 2,
    },
    {
      slug: 'eleve',
      name: 'Élève',
      permission: 3,
    },
  ]);

  await User.bulkCreate([
    {
      username: 'llaudrain',
      firstName: 'Lukas',
      lastName: 'Laudrain',
      gender: true,
      password: bcrypt.hashSync('1234', 10),
    },
    {
      username: 'rrambeau',
      firstName: 'Robinson',
      lastName: 'Rambeau',
      gender: true,
      password: bcrypt.hashSync('1234', 10),
    },
    {
      username: 'ryazid',
      firstName: 'Rose',
      lastName: 'Yazid',
      gender: false,
      password: bcrypt.hashSync('1234', 10),
    },
    {
      username: 'elaurent',
      firstName: 'Eric',
      lastName: 'Laurent',
      gender: true,
      password: bcrypt.hashSync('1234', 10),
    },
    {
      username: 'fbernard',
      firstName: 'Fabrice',
      lastName: 'Bernard',
      gender: true,
      password: bcrypt.hashSync('1234', 10),
    },
  ]);

  await Group.bulkCreate([
    {
      slug: '1ere2',
      name: '1ère2',
    },
    {
      slug: '1ere3',
      name: '1ère3',
    },
    {
      slug: '1ere4',
      name: '1ère4',
    },
  ]);

  await VerificationType.bulkCreate([
    {
      name: 'Hybride',
      slug: 'hybride',
    },
    {
      name: 'Automatique',
      slug: 'automatique',
    },
    {
      name: 'Manuel',
      slug: 'manuel',
    },
  ]);

  await QuestionSpecification.bulkCreate([
    {
      slug: 'nombre-entier',
      name: 'Nombre entier',
      questionType: 'numericQuestion',
    },
    {
      slug: 'nombre-decimal',
      name: 'Nombre décimal',
      questionType: 'numericQuestion',
    },
    {
      slug: 'pourcentage',
      name: 'Pourcentage',
      questionType: 'numericQuestion',
    },
    {
      slug: 'prix',
      name: 'Prix',
      questionType: 'numericQuestion',
    },
    {
      slug: 'date',
      name: 'Date',
      questionType: 'numericQuestion',
    },
    {
      slug: 'date-et-heure',
      name: 'Date et heure',
      questionType: 'numericQuestion',
    },
    {
      slug: 'choix-unique',
      name: 'Choix unique',
      questionType: 'choiceQuestion',
    },
    {
      slug: 'choix-multiple',
      name: 'Choix multiple',
      questionType: 'choiceQuestion',
    },
  ]);

  const lukas = await User.findOne({ where: { username: 'llaudrain' } });
  const rose = await User.findOne({ where: { username: 'ryazid' } });
  const admin = await Role.findOne({ where: { slug: 'admin ' } });
  const group = await Group.findOne({ where: { slug: '1ere3' } });
  if (!lukas || !rose || !admin || !group) return;

  await lukas.setRole(admin);
  await rose.setRole(admin);
  await lukas.addGroup(group);

  const groupBis = await Group.findOne({ where: { slug: '1ere2' } });
  if (!groupBis) return;

  const users = await User.findAll();

  users.forEach(async (user) => {
    await user.addGroup(groupBis);
  });
};
