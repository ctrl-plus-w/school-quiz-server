import bcrypt from 'bcrypt';
import database from '../models';

export default async () => {
  const { User, Role, Group } = database.models;

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
};
