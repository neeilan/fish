var FishGroup = require('../models/fishGroupModel.js');

exports.addFishToGroup = (req, res) => {
    FishGroup.findByIdAndUpdate(req.body.group, {
            $push: {
                fish: req.params.fishid
            }
        })
        .then(() => res.redirect('/fishgroups'))
        .catch(() => res.end("Error adding fish to group"));
};

exports.removeFishFromGroup = (req, res) => {
    FishGroup.findByIdAndUpdate(req.body.group, {
            $pull: {
                fish: req.params.fishid
            }
        })
        .then(() => res.redirect('/fishgroups'))
        .catch(() => res.end("Error adding fish to group"));
};

exports.viewFishGroups = (req, res) => {
    if (!req.user) return;
    FishGroup.find({
            owner: req.user.id
        })
        .populate('fish')
        .exec(function(err, groups) {
            if (err) {
                res.end('Error fetching groups');
            }
            res.render("groupsList", {
                groups: groups
            });
        })
};

exports.createFishGroup = (req, res) => {
    if (!req.user) return;
    if (!req.body.name) {
        return res.end("Please enter a valid group name");
    }
    var group = new FishGroup();
    group.name = req.body.name;
    group.owner = req.user.id;
    group.save().then(() => {
        res.redirect('/fishgroups');
    }).catch((e) => {
        res.end("There was an error creating this group.");
    })
};

exports.deleteFishGroup = (req, res) => {
    FishGroup.findByIdAndRemove(req.params.id)
        .then(() => {
            return res.redirect('/fishgroups');
        }).catch((e) => {
            res.end("There was an error while deleting the fishgroup");
        })
};
