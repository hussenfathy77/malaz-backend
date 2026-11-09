const communityService = require('../services/communityService');
const { getIo } = require('../socket');

const getCircles = async(req, res, next) => {
    try {
        const circles = await communityService.getSafeCircles(req.user.id);
        res.status(200).json({
            status: 'success',
            results: circles.length,
            data: { circles }
        });
    } catch (error) {
        next(error);
    }
};

const joinCircle = async(req, res, next) => {
    try {
        const member = await communityService.joinSafeCircle(req.user.id, req.params.id);
        res.status(201).json({
            status: 'success',
            data: { member }
        });
    } catch (error) {
        next(error);
    }
};

const getMessages = async(req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 50;

        const { messages, meta } = await communityService.getMessages(req.user.id, req.params.id, page, limit);
        res.status(200).json({
            status: 'success',
            results: messages.length,
            data: { messages },
            meta
        });
    } catch (error) {
        next(error);
    }
};

const sendMessage = async(req, res, next) => {
    try {
        const message = await communityService.sendMessage(req.user.id, req.params.id, req.body.content);

        // Broadcast in real-time to all circle members via Socket.io
        try {
            getIo().to(`circle:${req.params.id}`).emit('new-message', message);
        } catch (_) {}

        res.status(201).json({
            status: 'success',
            data: { message }
        });
    } catch (error) {
        next(error);
    }
};

const createCircle = async(req, res, next) => {
    try {
        const circle = await communityService.createSafeCircle(req.user.id, req.body);
        res.status(201).json({
            status: 'success',
            data: { circle }
        });
    } catch (error) {
        next(error);
    }
};

const addPatientToCircle = async(req, res, next) => {
    try {
        const member = await communityService.addPatientToCircle(req.user.id, req.params.id, req.body.patient_id);
        res.status(201).json({
            status: 'success',
            data: { member }
        });
    } catch (error) {
        next(error);
    }
};

const leaveCircle = async(req, res, next) => {
    try {
        await communityService.leaveSafeCircle(req.user.id, req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Successfully left the circle'
        });
    } catch (error) {
        next(error);
    }
};

const getJoinRequests = async(req, res, next) => {
    try {
        const requests = await communityService.getJoinRequests(req.user.id, req.params.id);
        res.status(200).json({ status: 'success', results: requests.length, data: { requests } });
    } catch (error) {
        next(error);
    }
};

const approveMember = async(req, res, next) => {
    try {
        const member = await communityService.approveMember(req.user.id, req.params.id, req.params.memberId);
        res.status(200).json({ status: 'success', data: { member } });
    } catch (error) {
        next(error);
    }
};

const rejectMember = async(req, res, next) => {
    try {
        await communityService.rejectMember(req.user.id, req.params.id, req.params.memberId);
        res.status(200).json({ status: 'success', message: 'Member request rejected' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCircles,
    joinCircle,
    getMessages,
    sendMessage,
    createCircle,
    addPatientToCircle,
    leaveCircle,
    getJoinRequests,
    approveMember,
    rejectMember
};
