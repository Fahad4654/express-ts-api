import { Profile } from "../models/Profile";
import { Request, RequestHandler, Response } from 'express';
import { User } from "../models/User";

//User Profile
export async function getUsersProfile(req: Request, res: Response) {
    try {
        const usersProfileList = await Profile.findAll({
            include: [{
                model: User,
                // Optionally exclude profile fields if needed
                attributes: ['id', 'name', 'email']
            }],
            nest: true,  // Preserves nested structure
            raw: true,   // Returns plain objects
            order: [[`${req.body.order ? req.body.order : 'id'}`, `${req.body.asc ? req.body.asc : 'ASC'}`]]  //{'property':'ASC/DESC'}}
        });
        console.log('Users list:', usersProfileList);
        res.status(201).json({
            message: "User fetching successfully",
            userProfiles: usersProfileList,
            status: "success"
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json(error);
    }
}

//Create User Profile
export async function createUserProfile(req: Request, res: Response) {
    try {
        const newUserProfile = await Profile.create({
            userId: req.body.id,
            bio: req.body.bio,
            avatarUrl: req.body.avatarUrl,
            phoneNumber: req.body.phoneNumber

        });

        const { phoneNumber, ...userWithoutphoneNumber } = newUserProfile.toJSON();
        console.log('Created user:', userWithoutphoneNumber);
        res.status(201).json({
            message: "User created successfully",
            user: userWithoutphoneNumber,
            status: "success"
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ status: 500, message: error.errors[0]?.message });
    }
}


//Delete User Profile
export const deleteUserProfile: RequestHandler = async (req, res) => {
    try {
        if (!req.body.userId) {
            res.status(400).json({ error: "UserId is required" });
            console.log(req.body.userId)
            return;
        }

        const foundUser = await User.findOne({
            where: { id: req.body.userId },
            attributes: ['id', 'name', 'email']
        })

        const deletedCount = await Profile.destroy({
            where: { userId: req.body.userId }
        });

        if (deletedCount === 0) {
            res.status(404).json({ error: "User's Profile not found", message: `User: ${foundUser?.name} doesn't have a profile` });
            console.log("User's Profile not found: ", foundUser?.email)
            return;
        }

        console.log("User's Profile found: ", foundUser?.email)
        res.status(200).json({
            message: `User: ${foundUser?.name}'s profile is being Deleted`,
            email: foundUser?.email
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ status: 500, message: error });;
    }
};