import bcrypt from 'bcrypt';

import { QuestionTypeSpecification } from '../models/questionTypeSpecification';
import { VerificationType } from '../models/verificationType';
import { Group } from '../models/group';
import { Role } from '../models/role';
import { User } from '../models/user';

export default async () => {
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

  await QuestionTypeSpecification.bulkCreate([
    {
      slug: 'nombre-entier',
      name: 'Nombre entier',
    },
    {
      slug: 'nombre-décimal',
      name: 'Nombre décimal',
    },
    {
      slug: 'pourcentage',
      name: 'Pourcentage',
    },
    {
      slug: 'prix',
      name: 'Prix',
    },
    {
      slug: 'date',
      name: 'Date',
    },
    {
      slug: 'date-et-heure',
      name: 'Date et heure',
    },
    {
      slug: 'choix-unique',
      name: 'Choix unique',
    },
    {
      slug: 'choix-multiple',
      name: 'Choix multiple',
    },
  ]);
};
