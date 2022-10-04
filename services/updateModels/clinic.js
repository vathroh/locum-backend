const Clinic = require('../../models/Clinic')

const updateClinicModel = async (req, res) => {
    const clinics = await Clinic.find()

    const datas = clinics.map(async (item) => {

        const data = {}
        data._id = item._id
        data.log = item.logo ?? ""
        data.group = item.group ?? ""
        data.clinicName = item.clinicName ?? ""
        data.description = item.description ?? ""
        data.clinicAddress = item.clinicAddress ?? ""
        data.location = item.location ?? ""
        data.type = item.type ?? []
        data.comments = item.comments ?? []
        data.createdAt = item.createdAt ?? ""
        data.updatedAt = item.updatedAt ?? ""

        await Clinic.updateOne({ _id: item._id }, { $set: data })

    })

    res.json(await Clinic.find())
}

module.exports = { updateClinicModel }