const User = require("../models/User");

// desc     Register user
// route    POST /api/v1/auth/register
// access   Public
exports.register = async (req, res, next) => {
  // res.status(200).json({success: true});
  try {
    const { name, email, password, role } = req.body;

    //Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// desc     Login user
// route    POST /api/v1/auth/login
// access   Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email or password
    if (!email || !password) {
      if (!email && !password)
        return res.status(400).json({
          success: false,
          msg: "Please provide an email and a password",
        });
      else if (!email)
        return res
          .status(400)
          .json({ success: false, msg: "Please provide an email" });
      return res
        .status(400)
        .json({ success: false, msg: "Please provide a password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }

    // Check password validation
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Wrong password" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(401).json({
      success: false,
      msg: "Can't convert email or password to string",
    });
  }
};

// desc     Get token from model, create cookie and send back response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJWTToken();

  const options = {
    expire: new Date(
      Date.now() + process.env.JWT_Cookie_Expire * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == "production") {
    options.secure = true;
  }
  res
    .status(statusCode) /*.cookie("token", token, options)*/
    .json({
      success: true,
      token,
      //add for frontend
      _id: user._id,
      name: user.name,
      email: user.email,
    });
};

// desc     Get current logged-in user
// route    POST /api/v1/auth/me
// access   Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

// desc     Log user out & clear token
// route    GET /api/v1/auth/logout
// access   Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};
