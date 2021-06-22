import {
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  FindOptions,
  Optional,
  Sequelize,
  Model,
  DataTypes,
} from 'sequelize';

import { Label } from './label';

interface GroupAttributes {
  id: number;
  slug: string;
  name: string;
}

interface GroupCreationAttributes extends Optional<GroupAttributes, 'id'> {}

export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly labels?: Label[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Labels properties */
  public getLabels!: BelongsToManyGetAssociationsMixin<Label>;
  public addLabel!: BelongsToManyAddAssociationMixin<Label, number>;
  public hasLabel!: BelongsToManyHasAssociationMixin<Label, number>;
}

export default (sequelize: Sequelize) => {
  Group.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
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

      hooks: {
        beforeFind: (options: FindOptions<GroupAttributes>) => {
          options.include = [
            {
              model: Label,
            },
          ];
        },
      },
    }
  );

  return Group;
};
