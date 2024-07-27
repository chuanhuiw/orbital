const router = require('express').Router();
const { User } = require('../models/user');

const badges = [
  { id: 1, price: 10 },
  { id: 2, price: 20 },
  { id: 3, price: 30 },
  { id: 4, price: 40 },
  { id: 5, price: 50 },
  { id: 6, price: 60 },
  { id: 7, price: 70 },
  { id: 8, price: 80 },
  { id: 9, price: 90 },
  { id: 10, price: 100 },
  { id: 11, price: 110 },
  { id: 12, price: 120 },
  { id: 13, price: 130 },
  { id: 14, price: 140 },
  { id: 15, price: 150 },
  { id: 16, price: 160 },
  { id: 17, price: 170 },
  { id: 18, price: 180 },
  { id: 19, price: 190 },
  { id: 20, price: 200 },
];

// Helper function to check if previous badges are unlocked
const arePreviousBadgesUnlocked = (unlockedBadges, badgeId) => {
  return badges.filter(badge => badge.id < badgeId).every(badge => unlockedBadges.includes(badge.id));
};

router.post('/', async (req, res) => {
  const { username, badgeId, badgePrice } = req.body;

  console.log(`Request to unlock badge: ${badgeId} for user: ${username}`);

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      console.error('User not found');
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.coins < badgePrice) {
      console.error('Not enough coins');
      return res.status(400).send({ message: 'Not enough coins' });
    }

    if (user.unlockedBadges.includes(badgeId)) {
      console.error('Badge already unlocked');
      return res.status(400).send({ message: 'Badge already unlocked' });
    }

    // Check if all previous badges are unlocked
    if (!arePreviousBadgesUnlocked(user.unlockedBadges, badgeId)) {
      console.error('Unlock previous badges before this one');
      return res.status(400).send({ message: 'Unlock previous badges before this one' });
    }

    user.coins -= badgePrice;
    user.unlockedBadges.push(badgeId);

    await user.save();

    console.log(`Badge ${badgeId} unlocked for user: ${username}`);
    res.status(200).send(user);
  } catch (error) {
    console.error('Error unlocking badge:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = router;
