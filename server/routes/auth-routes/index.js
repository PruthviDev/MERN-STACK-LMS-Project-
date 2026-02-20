const express = require("express");
const {registerUser, loginUser} = require("../../controllers/auth-controller/index");
const authenticate = require("../../middleware/auth-middleware")

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticate, (req, res) => {
  try{
 const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
  }
  catch(err){
    console.log(err);
  }
 
});

module.exports = router;
