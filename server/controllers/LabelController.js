import Label from '../models/Label.js';

export default {
    async view(req, res) {
        try {
            const { userId } = req.params;

            const getAllLabels = await Label.find({userId});
            res.status(200).json(getAllLabels);
        } catch (err) {
            res.status(400).json({message: err});
        }
    },
    async add(req , res) {
        try {
            const { userId } = req.params;

            const { name, color, fontColor, selectedStyle } = req.body;

            await Label.create({
                name,
                color,
                userId,
                fontColor,
                type: selectedStyle
            });
           
            res.status(200).json({message: 'Label was created!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async edit(req, res) {
        try {
            const { _id, name, color, type } = req.body;

            await Label.findOneAndUpdate({_id}, { name, color, type });

            res.status(200).json({message: 'Label updated!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;

            await Label.findByIdAndDelete(id);
            res.status(200).json({message: 'Label deleted!'});
        } catch (err) {
            console.log(err);
            res.status(400).json({message: 'Error, please try again later!'});
        }
    }
}