const { verify } = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const accessToken = req.header('accessToken');

    if (!accessToken) {
        return res.json({ error: "User does not logged in!" });
    } else {
        try {
            const validToken = verify(accessToken, "tOkEnSeCrEt");
            req.user = validToken;

            if (validToken) {
                return next();
            }
        } catch (err) {
            return res.json({ error: err });
        }
    }
};