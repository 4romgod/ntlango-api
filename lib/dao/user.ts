import {IUser, UserRegisterInput, UserUpdateInput} from 'ntlango-api-client';
import {ResourceNotFoundException, mongodbErrorHandler} from '../utils';
import User from '../models/user';

export type UserQueryParams = Partial<Record<keyof IUser, any>> & {userIDList?: Array<string>};

class UserDAO {
    static async create(userData: UserRegisterInput): Promise<IUser> {
        try {
            return await User.create(userData);
        } catch (error) {
            console.log(error);
            throw mongodbErrorHandler(error);
        }
    }

    static async readUserById(userID: string, projections?: Array<string>): Promise<IUser> {
        const query = User.findById(userID);
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        const user = await query.exec();

        if (!user) {
            throw ResourceNotFoundException('User not found');
        }
        return user;
    }

    static async readUsers(queryParams?: UserQueryParams, projections?: Array<string>): Promise<Array<IUser>> {
        console.log('queryParams', queryParams);
        const query = User.find({...queryParams});

        if (queryParams?.userIDList && queryParams.userIDList.length > 0) {
            query.where('userID').in(queryParams.userIDList);
        }

        if (projections && projections.length) {
            query.select(projections.join(' '));
        }

        console.log(query._mongooseOptions);

        const res = await query.exec();
        console.log(res);
        return res;
    }

    static async updateUser(userID: string, userData: UserUpdateInput) {
        const updatedUser = await User.findByIdAndUpdate(userID, userData, {new: true}).exec();
        if (!updatedUser) {
            throw ResourceNotFoundException('User not found');
        }
        return updatedUser;
    }

    static async deleteUser(userID: string): Promise<IUser> {
        const deletedUser = await User.findByIdAndRemove(userID).exec();
        if (!deletedUser) {
            throw ResourceNotFoundException('User not found');
        }
        return deletedUser;
    }
}

export default UserDAO;
