const User = require('../../models/User')

const updateUserModel = async (req, res) => {
    const users = await User.find()

    const datas = users.map(async (data) => {

        let dataitem = {}
        dataitem._id = data._id ?? ""
        dataitem.full_name = data.full_name ?? ""
        dataitem.code = data.about_me ?? ""
        dataitem.password = data.password ?? ""
        dataitem.email = data.email ?? ""
        dataitem.phone_number = data.phone_number ?? ""
        dataitem.firebaseUUID = data.firebaseUUID ?? ""
        dataitem.role = data.role ?? []
        dataitem.status = data.status ?? ""
        dataitem.blacklist = data.blacklist ?? false
        dataitem.profile_pict = data.profile_pict ?? ""
        dataitem.verification_code = data.verification_code ?? ""
        dataitem.certification = data.certification ?? []
        dataitem.achievement = data.achievement ?? []
        dataitem.resume = data.resume ?? ""
        dataitem.preferences = data.preferences ?? []

        await User.updateOne({ _id: dataitem._id }, { $set: dataitem })

    })

    res.json(await User.find())
}

module.exports = { updateUserModel }