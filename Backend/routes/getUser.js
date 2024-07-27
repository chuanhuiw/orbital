const router = require('express').Router();
const { User } = require('../models/user');

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
