import {Response, Request} from 'express'

import Activity from '../models/Activity';

export default {
    async view(req: Request, res: Response) {
        try {
            const {userId} = req.params;

            const getActivities = await Activity.find({userId}).sort({priority: 1});

            res.status(200).json(getActivities);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async add(req: Request , res: Response) {
        try {
            const {title, body, bookmark, bookmarkColor, userId} = req.body;

            await Activity.create({
                title,
                body,
                bookmark,
                bookmarkColor,
                userId
            });
           
            res.status(200).json({message: 'Saved susccessfuly!'});
        } catch (err) {
            res.status(400).json('Internal error, please try again or later!');
        }
    },
    async edit(req: Request, res: Response) {
        try {
            const {id, title, body, bookmark, bookmarkColor} = req.body;

            await Activity.findOneAndUpdate({_id: id}, {title, body, bookmark, bookmarkColor});

            res.status(200).json('Note updated!');
           
        } catch (err) {
            res.status(400).json(err);
        }
    },
    async delete(req: Request, res: Response) {
        try {
            const {id} = req.params;

            await Activity.findByIdAndDelete(id);
            
            res.status(200).json({message: 'Note deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: err});
        }
    }
}