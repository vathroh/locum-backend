const Calendar = require("../models/Calendar");
const { DateTime } = require("luxon");

const getEvents = async (req, res) => {
    try {
        const data = await Calendar.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventByUserId = async (req, res) => {
    try {
        const events = await Calendar.find({ user_id: req.params.userId })
            .lean()
            .sort({ start: 1 })
            .select({ user_id: 0, clinic_id: 0, job_id: 0 })
            .then(async (data) => {
                data.map((item) => {
                    item.date = DateTime.fromMillis(item.start)
                        .setZone("Asia/Singapore")
                        .toFormat("dd LLLL yyyy");
                    item.start = DateTime.fromMillis(item.start)
                        .setZone("Asia/Singapore")
                        .toLocaleString(DateTime.TIME_SIMPLE);
                    item.finish = DateTime.fromMillis(item.finish)
                        .setZone("Asia/Singapore")
                        .toLocaleString(DateTime.TIME_SIMPLE);
                    return item;
                });

                const events = [];

                for (i = 0; i < 16; i++) {
                    const item = {};
                    const date = DateTime.now().plus({ days: i });
                    item.date = date.toFormat("dd LLL");
                    item.event = "";
                    item.start = "";
                    item.finish = "";
                    item.type = "";
                    item.link = "";

                    const cal = await Calendar.find({
                        user_id: req.params.userId,
                        start: {
                            $gte: date.startOf("day").toMillis(),
                            $lte: date.endOf("day").toMillis(),
                        },
                    })
                        .sort({ start: 1 })
                        .lean()
                        .then((el) => {
                            el.map((j) => {
                                item.event = j.event ?? "";
                                item.start =
                                    DateTime.fromMillis(j.start)
                                        .setZone("Asia/Singapore")
                                        .toLocaleString(DateTime.TIME_SIMPLE) ??
                                    "";
                                item.finish =
                                    DateTime.fromMillis(j.finish)
                                        .setZone("Asia/Singapore")
                                        .toLocaleString(DateTime.TIME_SIMPLE) ??
                                    "";
                                item.type = j.type ?? "";
                            });
                        });

                    events.push(item);
                }

                res.json(events);
            });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const get3DaysEventByUserId = async (req, res) => {
    const data = [];

    for (i = 0; i < 3; i++) {
        const item = {};
        const date = DateTime.now().plus({ days: i });
        item.date = date.toFormat("dd LLL");
        item.event = "No Appoinment";

        const cal = await Calendar.find({
            user_id: req.params.userId,
            start: {
                $gte: date.startOf("day").toMillis(),
                $lte: date.endOf("day").toMillis(),
            },
        })
            .sort({ start: 1 })
            .lean()
            .then((el) => {
                el.map((j) => {
                    item.event = j.event;
                });
            });

        data.push(item);
    }

    return res.json(data);
};

const getEventById = async (req, res) => {
    try {
        const clinic = await Calendar.findById(req.params.id);
        res.json(clinic);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const saveEventByAPI = async (req, res) => {
    const calendar = new Calendar(req.body);
    try {
        const savedEvent = await calendar.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const saveEvent = async (data) => {
    const calendar = new Calendar(data);
    try {
        const savedEvent = await calendar.save();
        console.log("sukses");
    } catch (error) {}
};

const deleteEvent = async (req, res) => {
    const cekId = await Calendar.findById(req.params.id);
    if (!cekId)
        return res.status(404).json({
            message: "The data with id " + req.params.id + "is not found",
        });
    try {
        const deletedCalendar = await Calendar.deleteOne({
            _id: req.params.id,
        });
        res.status(200).json(deletedCalendar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    getEventByUserId,
    get3DaysEventByUserId,
    saveEvent,
    saveEventByAPI,
};
