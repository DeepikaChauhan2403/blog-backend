const UserSchema = require("../modles/UserSchema");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TURE, ERR, TRUE } = require("../constants");
const { verifyUsernameAndEmailExisits } = require("../utils/verifyEmailUsername");
const { addUserToDB, getUserDataFromUsername, getUserDataFromEmail, getAllUsersFromDB } = require("../repository/user.repository");

const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);


// POST - Register User
const registerUser = async (req, res) => {
    //Data validation
    const isValid = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().min(5).max(30).alphanum().required(),
        password: Joi.string().min(8).required(),
        email: Joi.string().email().required(),
    }).validate(req.body);

    if (isValid.error) {
        return res.status(400).send({
            status: 400,
            message: "Invalid Input",
            data: isValid.error,
        });
    }

    // Checking that username and email are not already registered 
    const isUserExisiting = await verifyUsernameAndEmailExisits(req.body.email, req.body.username);

    if (isUserExisiting === TRUE) {
        return res.status(400).send({
            status: 400,
            message: "Email or Username already exists.",
        });
    }
    else if (isUserExisiting === ERR) {
        return res.status(400).send({
            status: 400,
            message: "Err: verifyUsernameAndEmailExisits failed.",
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

    // Creating user obj using User schema
    const userObj = new UserSchema({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    })

    // Saving user obj to DB
    const response = await addUserToDB(userObj);

    if (response === ERR) {
        res.status(400).send({
            status: 400,
            message: "DB Error: Failed to add new user.",
        });
    }
    else if (response === TRUE) {
        res.status(201).send({
            status: 201,
            message: "User added.",
        });
    }
};

// Post - Login user
const loginUser = async (req, res) => {
    const { loginId, password } = req.body;

    const isEmail = Joi.object({
        loginId: Joi.string().email().required(),
    }).validate({loginId});

    let userData;

    if (isEmail.error) {
        userData = await getUserDataFromUsername(loginId);
        if (userData.err) {
            return res.status(400).send({
                status: 400,
                message: "DM error: getUserDataFromUsername failed",
                data: userData.err,
            });
        }
    }
    else {
        userData = await getUserDataFromEmail(loginId);
        if (userData.err) {
            return res.status(400).send({
                status: 400,
                message: "DM error: getUserDataFromEmail failed",
                data: userData.err,
            });
        }
    }

    if (!userData.data) {
        return res.status(400).send({
            status: 400,
            message: "No user found! Please register",
        });
    }

    // Password verfication
    const isPasswordMatching = await bcrypt.compare(password, userData.data.password);

    if(!isPasswordMatching){
        return res.status(400).send({
            status: 400,
            message: "Incorrect Password",
        });
    }

    const payload = {
        username: userData.data.username,
        name: userData.data.name,
        email: userData.data.email,
        userId: userData.data._id,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).send({
        status: 200,
        message: "Logged in",
        data: {
            token,
        },
    });
};


const getAllUsers = async (req, res) => {
    const userId = req.locals.userId;

    const allUsersData = await getAllUsersFromDB(userId);

    if(allUsersData.err){
        return res.status(400).send({
            status: 400,
            message: "DB Error: getAllUsersFromDB failed",
        });
    }

        let userData = [];
        allUsersData.data.map((user) => {
            let userObj = {
                name: user.name,
                username: user.username,
                email: user.email,
                _id: user._id,
            };

            userData.push(userObj);
        });
    
        res.status(200).send({
            status: 200,
            message: "All users fetched ",
            data: userData,
        });
};


module.exports = { registerUser, loginUser, getAllUsers };