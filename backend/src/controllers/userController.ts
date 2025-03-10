//userController.ts
import { Request, Response } from 'express';
import { setUserAsVerifiedDB } from '../models/userModel';

export const getUser = async (req: Request, res: Response): Promise<void> => {
    // Access the user data from req.user (which is populated by the middleware)
    const user = req.user;
  
    if (!user) {
        res.status(404).json({ error: "User not found" });
      return;
    }
  
    // Return the user details (you can customize this based on your database schema)
    res.status(200).json({
      id: user.id,         // Assuming `id` is the primary key in your users table
      email: user.email,   // Assuming you store user email
      username: user.username, // Assuming the username is in the user model
    });
  };

  export const markVerified = async (req: Request, res: Response): Promise<void> => {
    try {
      // Access the user data from req.user (which is populated by the middleware)
      const user = req.user;
  
      if (!user) {
        console.error("markVerified Error: User not found in request.");
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      // Attempt to mark the user as verified
      const result = await setUserAsVerifiedDB(user.id);
  
      if (result.rowCount === 0) {
        console.log(`markVerified Info: User ID ${user.id} is already verified.`);
        res.status(200).json({
          message: "User is already verified.",
          user,
        });
        return;
      }
  
      console.log(`User ID ${user.id} successfully marked as verified.`);
      res.status(200).json({
        message: "User marked as verified successfully.",
        user: result.rows[0], // Return updated user data
      });
    } catch (error) {
      console.error("markVerified Error:", error);
      res.status(500).json({ error: "An error occurred while marking user as verified." });
    }
  };
  