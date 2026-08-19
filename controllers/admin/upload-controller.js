module.exports.index = async (req, res) => {
    // console.log(req.body)
    res.json({
        location: req.body.file
    })
}