import {
  BelongsToManyAddAssociationMixin,
  FindOptions,
  Optional,
  Sequelize,
  Model,
  DataTypes,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
} from 'sequelize';

import { Label } from './label';

interface GroupAttributes {
  id: number;
  slug: string;
  name: string;
}

export type GroupCreationAttributes = Optional<GroupAttributes, 'id'>;

export class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public slug!: string;
  public name!: string;

  public readonly labels?: Label[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /* Labels properties */
  public addLabel!: BelongsToManyAddAssociationMixin<Label, number>;
  public addLabels!: BelongsToManyAddAssociationsMixin<Label, number>;
  public removeLabel!: BelongsToManyRemoveAssociationMixin<Label, number>;
}

export default (sequelize: Sequelize): typeof Group => {
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
