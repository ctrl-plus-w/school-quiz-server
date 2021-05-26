import { BelongsToManyAddAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, Sequelize } from 'sequelize/types';

import { Model, DataTypes } from 'sequelize';

import { Label } from './label';

interface GroupAttributes {
  slug: string;
  name: string;
}

export class Group extends Model<GroupAttributes> implements GroupAttributes {
  public slug!: string;
  public name!: string;

  public getLabels!: BelongsToManyGetAssociationsMixin<Label>;
  public addLabel!: BelongsToManyAddAssociationMixin<Label, number>;
  public hasLabel!: BelongsToManyHasAssociationMixin<Label, number>;

  public readonly labels?: Label[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Group.init(
    {
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'group',
      tableName: 'Group',
    }
  );

  return Group;
};
