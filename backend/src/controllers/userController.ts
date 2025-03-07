//userController.ts
import { Request, Response } from 'express';

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
