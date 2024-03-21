const { json } = require('express');
const Hospital = require('../models/Hospital');
const { parse } = require('dotenv');
const VacCenter = require('../models/VacCenter');

// desc     Get all hospitals
// route    GET /api/v1/hospitals
// access   Public
exports.getHospitals =  async (req,res,next) => {
    let query;

    // copy req.query into array of key and value -> { select: 'name,province,...', sort: 'name' }
    const reqQuery = {...req.query};

    // loop over array to remove remove fields from reqQuery
    ['select','sort','page','limit'].forEach(param => delete reqQuery[param]);
    
    // create request string and operators (lt lte gt gte in) using regular expressions
    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

    // select
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // sort 
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // pagination
    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Hospital.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // execute query
        const hospitals = await query;

        // pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {page: page+1, limit};
        }
        if (startIndex > 0) {
            pagination.prev = {page: page-1, limit};
        }

        res.status(200).json({
            success: true,
            count: hospitals.length,
            pagination,
            data: hospitals
        });
    } catch(err) {
        res.status(400),json({success: false});
    }
}

// desc     Get single hospital
// route    GET /api/v1/hospitals/:id
// access   Public
exports.getHospital = async (req,res,next) => {
    // res.status(200).json({success:true, msg:`Show hospital ${req.params.id}`});
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch(err) {
        res.status(400).json({success: false});
    }
}

// desc     Create new hospital
// route    POST /api/v1/hospitals
// access   Private
exports.createHospital = async (req,res,next) => {
    // res.status(200).json({success:true, msg:'Create new hospitals'});
    console.log(req.body);

    const hospital = await Hospital.create(req.body);

    res.status(201).json({
        succes:true,
        data:hospital
    });
}

// desc     Update hospital
// route    PUT /api/v1/hospitals/:id
// access   Private
exports.updateHospital = async (req,res,next) => {
    // res.status(200).json({success:true, msg:`Update hospital ${req.params.id}`});
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hospital) {
            return res.status(400).json({success: false});
        }

        res.status(200).json({
            success: true,
            data: hospital
        });
    } catch(err) {
        res.status(400).json({success: false});
    }
}

// desc     Delete hospital
// route    DELETE /api/v1/hospitals/:id
// access   Private
exports.deleteHospital = async (req,res,next) => {
    // res.status(200).json({success:true, msg:`Delete hospital ${req.params.id}`});
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(400).json({succes: false});
        }

        await hospital.deleteOne();
        res.status(200).json({success: true, data: {} });
    } catch {
        res.status(400).json({success: false});
    }
}

// desc     Get vaccine centers
// route    GET /api/v1/hospitals/vacCenters/
// access   Public
exports.getVacCenters = (req,res,next) => {
    VacCenter.getAll((err,data) => {
        if (err) {
            res.status(500).send({
                msg : err.msg || "Some error occured while retrieving Vaccine Centers"
            });
        } else res.send(data);
    });
};