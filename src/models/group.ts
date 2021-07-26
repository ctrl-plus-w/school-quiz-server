import {
  BelongsToManyAddAssociationMixin,
  Optional,
  Sequelize,
  Model,
  DataTypes,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  FindAttributeOptions,
} from 'sequelize';

import { Label } from './label';
import { User } from './user';

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

  /* Users property */
  public getUsers!: BelongsToManyGetAssociationsMixin<User>;

  public getRelatedGroups!: (attributes?: FindAttributeOptions) => Promise<Array<Group>>;
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
    }
  );

  Group.prototype.getRelatedGroups = async function (attributes?: FindAttributeOptions) {
    const groupUsers = await this.getUsers({ attributes: ['id'] });
    const groupUsersId = groupUsers.map((user) => user.id);

    const relatedGroups = Group.findAll({ include: { model: User, where: { id: groupUsersId }, attributes: ['id'] }, attributes });
    return relatedGroups;
  };

  return Group;
};
