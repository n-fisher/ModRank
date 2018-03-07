var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    var list = app.get('masterDB');
    var cache = app.get('Cacher');

    res.render("index", {
        title: 'ModRank',
        llen: list.length ? list.length : 0,

        favTop1: cache.getMostFavsItem(1),
        subTop1: cache.getMostSubsItem(1),
        viewTop1: cache.getMostViewsItem(1),
        commentTop1: cache.getMostCommentsItem(1),
        unsubscribeTop1: cache.getMostUnsubscribesItem(1),

        favTop2: cache.getMostFavsItem(2),
        subTop2: cache.getMostSubsItem(2),
        viewTop2: cache.getMostViewsItem(2),
        commentTop2: cache.getMostCommentsItem(2),
        unsubscribeTop2: cache.getMostUnsubscribesItem(2),

        favTop3: cache.getMostFavsItem(3),
        subTop3: cache.getMostSubsItem(3),
        viewTop3: cache.getMostViewsItem(3),
        commentTop3: cache.getMostCommentsItem(3),
        unsubscribeTop3: cache.getMostUnsubscribesItem(3)
    });
});

module.exports = router;