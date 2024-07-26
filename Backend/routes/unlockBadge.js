const router = require('express').Router();
const { User } = require('../models/user');

// Helper function to check if previous badges are unlocked
const arePreviousBadgesUnlocked = (unlockedBadges, badgeId) => {
  return badges.filter(badge => badge.id < badgeId).every(badge => unlockedBadges.includes(badge.id));
};

router.post('/:username', async (req, res) => {
  const { username, badgeId, badgePrice } = req.body;

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.coins < badgePrice) {
      return res.status(400).send({ message: 'Not enough coins' });
    }

    if (user.unlockedBadges.includes(badgeId)) {
      return res.status(400).send({ message: 'Badge already unlocked' });
    }

    // Check if all previous badges are unlocked
    if (!arePreviousBadgesUnlocked(user.unlockedBadges, badgeId)) {
      return res.status(400).send({ message: 'Unlock previous badges before this one' });
    }

    user.coins -= badgePrice;
    user.unlockedBadges.push(badgeId);

    await user.save();

    res.status(200).send(user);
  } catch (error) {
    console.error('Error unlocking badge:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
