const Sauce = require('../models/Sauces');
const fs = require('fs');

exports.createSauces = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,

        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistré' }) })
        .catch(error => { res.status(400).json({ error }) })
};
exports.modifySauces = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'vous ne pouvez pas modifier' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }))
};

exports.getOneSauces = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(400).json({ error });
        }
    );
};

exports.deleteSauces = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                const filename = sauce.imageUrl.split('/images')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce Supprimée' }))
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

exports.likeASauces = (req, res, next) => {
    switch (req.body.like) {
        case 1:
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId } })
                .then(() => res.status(200).json({ message: 'Sauce likée' }))
                .catch(error => res.status(400).json({ error }));
            break;

        case -1:
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId } })
                .then(() => res.status(200).json({ message: 'Sauce dislikée' }))
                .catch(error => res.status(400).json({ error }));
            break;

        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then(sauce => {

                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
                        )
                            .then(() => res.status(201).json({ message: 'Like annulé' }))
                            .catch((error) => res.status(400).json({ error }));
                    }

                    else if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
                        )
                            .then(() => res.status(201).json({ message: 'dislike annulé' }))
                            .catch((error) => res.status(400).json({ error }));
                    }

                    else {
                        res.status(403).json({ message: "erreur." })
                            .catch((error) => res.status(400).json({ error }));
                    }
                })
                .catch(() => res.status(500).json({ error }));
            break;
    }
};
